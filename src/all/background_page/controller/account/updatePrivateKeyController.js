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
 * @since         3.6.3
 */
import {FileController as fileController} from "../fileController";
import AccountModel from "../../model/account/accountModel";
import PassphraseStorageService from "../../service/session_storage/passphraseStorageService";

const RECOVERY_KIT_FILENAME = "passbolt-recovery-kit.asc";

class UpdatePrivateKeyController {
  /**
   * UpdatePrivateKeyController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions the api client options
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.apiClientOptions = apiClientOptions;
    this.accountModel = new AccountModel(apiClientOptions);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @return {Promise<void>}
   */
  async _exec(oldPassphrase, newPassphrase) {
    try {
      await this.exec(oldPassphrase, newPassphrase);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Updates the passphrase of the current user's private key and then starts a download of the new key.
   *
   * @returns {Promise<void>}
   */
  async exec(oldPassphrase, newPassphrase) {
    if (typeof oldPassphrase !== 'string' || typeof newPassphrase !== 'string') {
      throw new Error('The old and new passphrase have to be string');
    }
    const userPrivateArmoredKey = await this.accountModel.updatePrivateKey(oldPassphrase, newPassphrase);
    await PassphraseStorageService.flushPassphrase();
    await fileController.saveFile(RECOVERY_KIT_FILENAME, userPrivateArmoredKey, "text/plain", this.worker.tab.id);
  }
}

export default UpdatePrivateKeyController;
