/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.3.0
 */

import Keyring from "../../model/keyring";
import i18n from "../../sdk/i18n";
import GpgKeyError from "../../error/GpgKeyError";
import GetPassphraseService from "../../service/passphrase/getPassphraseService";

class GetUserPrivateKeyController {
  /**
   * GetUserPrivateKeyController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   */
  constructor(worker, requestId, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.keyring = new Keyring();
    this.getPassphraseService = new GetPassphraseService(account);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @returns {Promise<void>}
   */
  async _exec() {
    try {
      const armoredEncryptedPrivateKey = await this.exec();
      this.worker.port.emit(this.requestId, "SUCCESS", armoredEncryptedPrivateKey);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }
  /**
   * Returns the current user's armored private key after requesting its passphrase.
   *
   * @returns {Promise<string>}
   */
  async exec() {
    await this.getPassphraseService.requestPassphrase(this.worker);
    const keyring = new Keyring();
    const privateKeyInfo = keyring.findPrivate();
    if (!privateKeyInfo) {
      throw new GpgKeyError(i18n.t('Private key not found.'));
    }
    return privateKeyInfo.armoredKey;
  }
}

export default GetUserPrivateKeyController;
