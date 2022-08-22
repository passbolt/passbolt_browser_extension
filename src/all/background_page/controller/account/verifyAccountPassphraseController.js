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
import DecryptPrivateKeyService from "../../service/crypto/decryptPrivateKeyService";


class VerifyAccountPassphraseController {
  /**
   * Constructor.
   * @param {Worker} worker The associated worker.
   * @param {string} requestId The associated request id.
   * @param {AbstractAccountEntity} account The account associated to the worker.
   */
  constructor(worker, requestId, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.account = account;
  }

  /**
   * Controller executor.
   * @param {string} passphrase The passphrase with which to check setup's private key decryption
   * @returns {Promise<void>}
   */
  async _exec(passphrase) {
    try {
      await this.exec(passphrase);
      this.worker.port.emit(this.requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Verify the account passphrase.
   * @param {string} passphrase The passphrase.
   * @throws {Error} if the account does not have a user private key.
   * @throws {TypeError} if the passphrase is not a valid string.
   * @throws {InvalidMasterPasswordError} if the passphrase can't be decrypt the account user private key.
   * @returns {Promise<void>}
   */
  async exec(passphrase) {
    const privateArmoredKey = this.account?.userPrivateArmoredKey;
    if (!privateArmoredKey) {
      throw new Error('An account user private key is required.');
    }
    if (typeof passphrase !== "string") {
      throw new TypeError("The passphrase should be a string.");
    }
    const privateKey = await OpenpgpAssertion.readKeyOrFail(privateArmoredKey);
    await DecryptPrivateKeyService.decrypt(privateKey, passphrase);
  }
}

export default VerifyAccountPassphraseController;
