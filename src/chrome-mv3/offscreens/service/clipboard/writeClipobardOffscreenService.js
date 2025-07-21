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
export const SEND_MESSAGE_TARGET_CLIPBOARD_WRITE_OFFSCREEN = "clipboard-write-offscreen";
export const SEND_MESSAGE_TARGET_CLIPBOARD_WRITE_OFFSCREEN_RESPONSE_HANDLER = "service-worker-clipboard-write-text-offscreen-response-handler";

export default class WriteClipobardOffscreenService {
  /**
   * Handle clipboard request.
   * @param {{clipboardContent: string}} message arguments to pass to the clipboard.writeText.
   * @returns {Promise<object>}
   */
  static async handleClipboardRequest({clipboardContent}) {
    await WriteClipobardOffscreenService._handleClipboardWriteTextRequest(clipboardContent);
    return WriteClipobardOffscreenService._endClipboardWrite();
  }

  /**
   * Handles and emulates a clipboard::writeText(data)
   * @param {string} clipboardContent
   * @returns {Promise<void>}
   * @private
   */
  static async _handleClipboardWriteTextRequest(clipboardContent) {
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    textarea.value = clipboardContent;
    textarea.select();
    document.execCommand("cut");
    document.body.removeChild(textarea);
  }

  /**
   * Return the clipboard write success data to send back to the requester.
   * @returns {object}
   * @private
   */
  static _endClipboardWrite() {
    return {
      data: null,
      target: SEND_MESSAGE_TARGET_CLIPBOARD_WRITE_OFFSCREEN_RESPONSE_HANDLER,
    };
  }
}
