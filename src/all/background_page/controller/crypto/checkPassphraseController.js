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
import Keyring from "../../model/keyring";
import CheckPassphraseService from "../../service/crypto/checkPassphraseService";

class CheckPassphraseController {
  /**
   * CheckPassphraseController constructor
   * @todo multi-account to replace by verifyAccountPassphraseController.
   *
   * @param {Worker} worker
   * @param {string} requestId uuid
   */
  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
    this.keyring = new Keyring();
    this.checkPassphraseService = new CheckPassphraseService(this.keyring);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @param {string} passphrase The passphrase with which to try the current user's key decryption.
   * @returns {Promise<void>}
   */
  async _exec(passphrase) {
    try {
      await this.exec(passphrase);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Tries to decrypt the current user private key with the given passphrase
   *
   * @param {string} passphrase The passphrase of the current user's key.
   * @returns {Promise<void>}
   * @throws {InvalidMasterPasswordError} if the passphrase can't decrypt the current user's key.
   * @throws {GpgKeyError} if no private key could be found.
   */
  async exec(passphrase) {
    await this.checkPassphraseService.checkPassphrase(passphrase);
  }
}

export default CheckPassphraseController;
