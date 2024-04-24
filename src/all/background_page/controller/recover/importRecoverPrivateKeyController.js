/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.6.0
 */
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import GpgKeyError from "../../error/GpgKeyError";
import i18n from "../../sdk/i18n";
import AuthVerifyServerChallengeService from "../../service/auth/authVerifyServerChallengeService";
import AccountTemporarySessionStorageService from "../../service/sessionStorage/accountTemporarySessionStorageService";
import FindAccountTemporaryService from "../../service/account/findAccountTemporaryService";

class ImportRecoverPrivateKeyController {
  /**
   * Constructor.
   * @param {Worker} worker The associated worker.
   * @param {string} requestId The associated request id.
   * @param {ApiClientOptions} apiClientOptions the api client options
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.authVerifyServerChallengeService = new AuthVerifyServerChallengeService(apiClientOptions);
  }

  /**
   * Controller executor.
   * @param {string} armoredKey The key to import
   * @returns {Promise<void>}
   */
  async _exec(armoredKey) {
    try {
      await this.exec(armoredKey);
      this.worker.port.emit(this.requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Import user key.
   * @param {string} armoredKey The key to import
   * @returns {Promise<void>}
   */
  async exec(armoredKey) {
    const temporaryAccount = await FindAccountTemporaryService.exec(this.worker.port._port.name);
    const privateKey = await OpenpgpAssertion.readKeyOrFail(armoredKey);
    OpenpgpAssertion.assertPrivateKey(privateKey);
    const fingerprint = privateKey.getFingerprint().toUpperCase();
    await this._assertImportKeyOwnedByUser(fingerprint, temporaryAccount.account.serverPublicArmoredKey);
    temporaryAccount.account.userPrivateArmoredKey = privateKey.armor();
    temporaryAccount.account.userPublicArmoredKey = privateKey.toPublic().armor();
    temporaryAccount.account.userKeyFingerprint = fingerprint;
    // Update all data in the temporary account stored
    await AccountTemporarySessionStorageService.set(temporaryAccount);
  }

  /**
   * Assert import key is owned by the user doing the recover.
   * @todo for now the function only check that the key is recognized by the server. The API does offer yet a way to verify that a key is associated to a user id.
   * @param {string} fingerprint The import key fingerprint
   * @param {string} serverPublicArmoredKey The server public armored key
   * @returns {Promise<void>}
   * @throws {GpgKeyError} If the key is already used
   * @private
   */
  async _assertImportKeyOwnedByUser(fingerprint, serverPublicArmoredKey) {
    if (!serverPublicArmoredKey) {
      throw new Error('The server public key should have been provided before importing a private key');
    }

    try {
      await this.authVerifyServerChallengeService.verifyAndValidateServerChallenge(fingerprint, serverPublicArmoredKey);
    } catch (error) {
      console.error(error);
      // @todo Handle not controlled errors, such as timeout error...
      throw new GpgKeyError(i18n.t('This key does not match any account.'));
    }
  }
}

export default ImportRecoverPrivateKeyController;
