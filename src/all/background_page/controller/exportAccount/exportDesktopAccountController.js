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

import DesktopTransferModel from "../../model/desktopTransfer/desktopTransferModel";
import FileService from "../../service/file/fileService";
import {PassphraseController} from "../../controller/passphrase/passphraseController";

class ExportDesktopAccountController {
  /**
   * ExportAccountController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {AccountEntity}  account
   */
  constructor(worker, requestId, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.desktopTransferModel = new DesktopTransferModel();
    this.account = account;
  }

  /**
   * Controller executor.
   * @returns {Promise<void>}
   */
  async _exec() {
    try {
      await this.exec.apply(this, arguments);
      this.worker.port.emit(this.requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Export account for desktop application
   *
   * @return {Promise<string>}
   */
  async exec() {
    await PassphraseController.get(this.worker);
    const accountKit = await this.desktopTransferModel.getAccountKit(this.account);
    await FileService.saveFile("account-kit.json", JSON.stringify(accountKit.toDto()), "application/json", this.worker.tab.id);
  }
}

export default ExportDesktopAccountController;

