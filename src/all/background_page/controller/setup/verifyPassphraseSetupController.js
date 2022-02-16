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

const {SetupEntity} = require("../../model/entity/setup/setupEntity");
const {DecryptPrivateKeyService} = require("../../service/crypto/decryptPrivateKeyService");

class VerifyPassphraseSetupController {
  /**
   * Constructor.
   * @param {Worker} worker The associated worker.
   * @param {string} requestId The associated request id.
   * @param {SetupEntity} setupEntity The associated setup entity.
   */
  constructor(worker, requestId, setupEntity) {
    if (!setupEntity) {
      throw new Error("The setupEntity can't be null");
    }

    if (!(setupEntity instanceof SetupEntity)) {
      throw new Error("the setupEntity must be of type SetupEntity");
    }

    this.worker = worker;
    this.requestId = requestId;
    this.setupEntity = setupEntity;
  }

  /**
   * Controller executor.
   * @param {string} passphrase The passphrase with which to check setup's private key decryption
   * @param {boolean?} rememberUntilLogout (Optional) should the passphrase be remembered until the user is logged out?
   * @returns {Promise<void>}
   */
  async _exec(passphrase, rememberUntilLogout) {
    try {
      await this.exec(passphrase, rememberUntilLogout);
      this.worker.port.emit(this.requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Verify the imported key passphrase
   * @param {string} passphrase The passphrase with which to check setup's private key decryption
   * @param {boolean?} rememberUntilLogout (Optional) The passphrase should be remembered until the user is logged out
   * @throws {InvalidMasterPasswordError} if the setup's private key can't be decrypted with the passphrase
   * @returns {Promise<void>}
   */
  async exec(passphrase, rememberUntilLogout) {
    const privateArmoredKey = this.setupEntity?.userPrivateArmoredKey;
    if (!privateArmoredKey) {
      throw new Error('A private key should have been provided before checking the validity of its passphrase');
    }
    await DecryptPrivateKeyService.decrypt(privateArmoredKey, passphrase);

    // Store the user passphrase to login in after the setup operation.
    this.setupEntity.passphrase = passphrase;
    if (rememberUntilLogout) {
      this.setupEntity.rememberUntilLogout = rememberUntilLogout;
    }
  }
}

exports.VerifyPassphraseSetupController = VerifyPassphraseSetupController;
