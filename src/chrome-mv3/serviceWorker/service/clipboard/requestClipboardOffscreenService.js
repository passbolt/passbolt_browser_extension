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
import CreateOffscreenDocumentService from "../offscreen/createOffscreenDocumentService";
import HandleOffscreenResponseService from "../offscreen/handleOffscreenResponseService";

const {SEND_MESSAGE_TARGET_CLIPBOARD_WRITE_OFFSCREEN} = require("../../../offscreens/service/clipboard/writeClipobardOffscreenService");

export class RequestClipboardOffscreenService {
  /**
   * Run the equivalent of navigator.clipboard::writeText(content) through offscreen.
   * @param {string} clipboardContent the content to copy to clipboard
   * @returns {Promise<void>}
   */
  static async writeText(clipboardContent) {
    await CreateOffscreenDocumentService.createIfNotExistOffscreenDocument();

    const requestId = crypto.randomUUID();
    const offscreenClipboardData = {clipboardContent};

    return new Promise((resolve, reject) => {
      // Stack the response listener callbacks.
      HandleOffscreenResponseService.setResponseCallback(requestId, {resolve, reject});
      return RequestClipboardOffscreenService.sendWriteTextOffscreenMessage(requestId, offscreenClipboardData)
        .catch(reject);
    });
  }

  /**
   * Send message to the offscreen document for emulating a navigator.clipboard::writeText(data) operation.
   * @param {object} offscreenData The data to copy to clipboard.
   * @returns {Promise<*>}
   */
  static async sendWriteTextOffscreenMessage(id, data) {
    return chrome.runtime.sendMessage({
      id: id,
      data: data,
      target: SEND_MESSAGE_TARGET_CLIPBOARD_WRITE_OFFSCREEN,
    });
  }
}
