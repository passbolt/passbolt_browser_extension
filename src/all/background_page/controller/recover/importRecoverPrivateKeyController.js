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
import GpgAuth from "../../model/gpgauth";
import GpgKeyError from "../../error/GpgKeyError";
import i18n from "../../sdk/i18n";

class ImportRecoverPrivateKeyController {
  /**
   * Constructor.
   * @param {Worker} worker The associated worker.
   * @param {string} requestId The associated request id.
   * @param {AccountRecoverEntity} account The account being recovered.
   */
  constructor(worker, requestId, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.account = account;
    this.legacyAuthModel = new GpgAuth();
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
    const privateKey = await OpenpgpAssertion.readKeyOrFail(armoredKey);
    OpenpgpAssertion.assertPrivateKey(privateKey);
    await this._assertImportKeyOwnedByUser(privateKey.getFingerprint().toUpperCase());
    this.account.userPrivateArmoredKey = privateKey.armor();
    this.account.userPublicArmoredKey = privateKey.toPublic().armor();
  }

  /**
   * Assert import key is owned by the user doing the recover.
   * @todo for now the function only check that the key is recognized by the server. The API does offer yet a way to verify that a key is associated to a user id.
   * @param {string} fingerprint The import key fingerprint
   * @returns {Promise<void>}
   * @throws {GpgKeyError} If the key is already used
   * @private
   */
  async _assertImportKeyOwnedByUser(fingerprint) {
    const domain = this.account.domain;
    const serverPublicArmoredKey = this.account.serverPublicArmoredKey;
    if (!serverPublicArmoredKey) {
      throw new Error('The server public key should have been provided before importing a private key');
    }

    try {
      await this.legacyAuthModel.verify(domain, serverPublicArmoredKey, fingerprint);
    } catch (error) {
      console.error(error);
      // @todo Handle not controlled errors, such as timeout error...
      throw new GpgKeyError(i18n.t('This key does not match any account.'));
    }
  }
}

export default ImportRecoverPrivateKeyController;
