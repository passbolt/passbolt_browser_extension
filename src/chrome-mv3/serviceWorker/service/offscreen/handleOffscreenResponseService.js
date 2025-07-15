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
import {assertUuid} from "../../../../all/background_page/utils/assertions";
import {SEND_MESSAGE_TARGET_CLIPBOARD_WRITE_OFFSCREEN_RESPONSE_HANDLER} from "../../../offscreens/service/clipboard/writeClipobardOffscreenService";
import {
  SEND_MESSAGE_TARGET_FETCH_OFFSCREEN_POLLING_HANDLER,
  SEND_MESSAGE_TARGET_FETCH_OFFSCREEN_RESPONSE_HANDLER
} from "../../../offscreens/service/network/fetchOffscreenService";
import {SEND_MESSAGE_TARGET_OFFSCREEN_ERROR_RESPONSE_HANDLER} from "../../../offscreens/service/offscreen/handleOffscreenRequestService";
import ResponseClipboardOffscreenService from "../clipboard/responseClipboardOffscreenService";
import ResponseFetchOffscreenService from "../network/responseFetchOffscreenService";

export default class HandleOffscreenResponseService {
  /**
   * @type {object}
   * @private
   */
  static _offscreenResponsePromisesCallbacks = {};

  /**
   * @type {Map<string, function>}
   * @private
   */
  static REPONSE_HANDLE_MAP = {
    [SEND_MESSAGE_TARGET_FETCH_OFFSCREEN_RESPONSE_HANDLER]: ResponseFetchOffscreenService.handleFetchResponse,
    [SEND_MESSAGE_TARGET_CLIPBOARD_WRITE_OFFSCREEN_RESPONSE_HANDLER]: ResponseClipboardOffscreenService.handleClipboardResponse,
    [SEND_MESSAGE_TARGET_OFFSCREEN_ERROR_RESPONSE_HANDLER]: HandleOffscreenResponseService.handleOffscreenError,
  };

  /**
   * Handle offscreen response.
   * @param {object} message Browser runtime.onMessage listener message.
   */
  static handleOffscreenResponse(message) {
    if (message.target === SEND_MESSAGE_TARGET_FETCH_OFFSCREEN_POLLING_HANDLER) {
      //it's a polling message that is only here to keep the offscreen document alive.
      return;
    }

    const responseHandler = HandleOffscreenResponseService.REPONSE_HANDLE_MAP[message.target];
    if (!responseHandler) {
      console.debug("HandleOffscreenResponseService received response not specific to offscreen.");
      return;
    }

    HandleOffscreenResponseService._assertOffscreenResponse(message);
    const promise = HandleOffscreenResponseService._consumeRequestPromiseCallbacksOrFail(message.id);

    responseHandler(message, promise);
  }

  /**
   * Handles generic offscreen error message.
   * @param {object} message
   * @param {{resolve: function, reject: function}} promise
   * @private
   */
  static handleOffscreenError(message, promise) {
    const error = new Error("Something went wrong while processing an offscreen request");

    const errorCauseString = message?.data?.error;
    if (errorCauseString) {
      const cause = JSON.parse(errorCauseString);
      error.cause = new Error();
      error.cause.name = cause.name;
      error.cause.message = cause.message;
      error.cause.stack = cause.stack;
    }

    promise.reject(error);
  }

  /**
   * Sets a new promise response callback for a given offscreen request id.
   * @param {string} id
   * @param {{resolve: function, reject: function}} promise
   */
  static setResponseCallback(id, promise) {
    HandleOffscreenResponseService._offscreenResponsePromisesCallbacks[id] = promise;
  }

  /**
   * Asserts that the given message is a valid offscreen response message.
   * @param {object} message
   * @throws {Error} if message.id is not a valid UUID
   * @private
   */
  static _assertOffscreenResponse(message) {
    assertUuid(message.id, "HandleOffscreenResponseService: message.id should be a valid uuid.");
  }

  /**
   * Consume the offscreen request promise callbacks or fail.
   * @param {string} id The identifier of the offscreen fetch request.
   * @returns {Promise}
   * @throws {Error} If no request promise callbacks can be found for the given offscreen fetch request id.
   * @private
   */
  static _consumeRequestPromiseCallbacksOrFail(id) {
    const offscreenRequestPromiseCallback = HandleOffscreenResponseService._offscreenResponsePromisesCallbacks[id];
    if (!offscreenRequestPromiseCallback) {
      throw new Error("HandleOffscreenResponseService: No request promise callbacks found for the given offscreen fetch request id.");
    }
    delete HandleOffscreenResponseService._offscreenResponsePromisesCallbacks[id];

    return offscreenRequestPromiseCallback;
  }
}
