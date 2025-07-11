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
 * @since         5.3.2
 */

import CopyToClipboardService from "../../service/clipboard/copyToClipboardService";

export default class CopyTemporarilyToClipboardController {
  /**
   * CopyTemporarilyToClipboardController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   */
  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
    this.copyToClipboardService = new CopyToClipboardService();
  }

  /**
   * Wrapper of exec function to run it with worker.
   * @param text {string} The text to copy
   * @return {Promise<void>}
   */
  async _exec(text) {
    try {
      await this.exec(text);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Temporarily copy text to clipboard
   *
   * @param text {string} The text to copy
   * @return {Promise<void>}
   */
  async exec(text) {
    await this.copyToClipboardService.copyTemporarily(text);
  }
}
