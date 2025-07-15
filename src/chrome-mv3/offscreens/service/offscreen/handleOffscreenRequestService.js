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

import FetchOffscreenService, {SEND_MESSAGE_TARGET_FETCH_OFFSCREEN} from "../network/fetchOffscreenService";
import WriteClipobardOffscreenService, {SEND_MESSAGE_TARGET_CLIPBOARD_WRITE_OFFSCREEN} from "../clipboard/writeClipobardOffscreenService";
import {assertUuid} from "../../../../all/background_page/utils/assertions";

export const SEND_MESSAGE_TARGET_OFFSCREEN_ERROR_RESPONSE_HANDLER = "service-worker-offscreen-error-response-handler";

export default class HandleOffscreenRequestService {
  /**
   * Handle fetch request.
   * @param {object} message Browser runtime.onMessage listener message.
   * @returns {Promise<void>}
   */
  static async handleOffscreenRequest(message) {
    HandleOffscreenRequestService._assertOffscreenRequest(message);

    const REQUEST_HANDLE_MAP = {
      [SEND_MESSAGE_TARGET_FETCH_OFFSCREEN]: FetchOffscreenService.handleFetchRequest,
      [SEND_MESSAGE_TARGET_CLIPBOARD_WRITE_OFFSCREEN]: WriteClipobardOffscreenService.handleClipboardRequest,
    };

    const requestHandler = REQUEST_HANDLE_MAP[message.target];
    if (!requestHandler) {
      console.debug(`HandleOffscreenRequestService received an unsupported request: "${message.target}".`);
      return;
    }

    try {
      const result = await requestHandler(message.data);
      HandleOffscreenRequestService._sendResponseBack(message.id, result);
    } catch (error) {
      HandleOffscreenRequestService._sendErrorResponseBack(message.id, error);
    }
  }

  /**
   * Handle fetch success, and send response to the service worker.
   * @param {string} id The fetch offscreen request id
   * @param {object} data the data to send back to the requester.
   * @returns {Promise<void>}
   */
  static async _sendResponseBack(id, data) {
    await chrome.runtime.sendMessage({
      id: id,
      ...data,
    });
  }

  /**
   * Handle fetch success, and send response to the service worker.
   * @param {string} id The fetch offscreen request id
   * @param {object} data the data to send back to the requester.
   * @returns {Promise<void>}
   */
  static async _sendErrorResponseBack(id, error) {
    await chrome.runtime.sendMessage({
      id: id,
      target: SEND_MESSAGE_TARGET_OFFSCREEN_ERROR_RESPONSE_HANDLER,
      data: {error: JSON.stringify(error, Object.getOwnPropertyNames(error))},
    });
  }

  /**
   * Asserts that the given message is a valid offscreen response message.
   * @param {object} message
   * @throws {Error} if message.id is not a valid UUID
   * @private
   */
  static _assertOffscreenRequest(message) {
    assertUuid(message.id, "HandleOffscreenRequestService: message.id should be a valid uuid.");
  }
}
