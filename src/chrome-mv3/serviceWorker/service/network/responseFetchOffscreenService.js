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
 * @since         4.7.0
 */

import {assertUuid} from "../../../../all/background_page/utils/assertions";
import {
  FETCH_OFFSCREEN_RESPONSE_TYPE_ERROR,
  FETCH_OFFSCREEN_RESPONSE_TYPE_SUCCESS,
  SEND_MESSAGE_TARGET_FETCH_OFFSCREEN_RESPONSE_HANDLER
} from "../../../offscreens/service/network/fetchOffscreenService";
import {RequestFetchOffscreenService} from "./requestFetchOffscreenService";

export default class ResponseFetchOffscreenService {
  /**
   * Handle fetch offscreen response message.
   * @param {object} message The message itself.
   * @return {void}
   */
  static handleFetchResponse(message) {
    // Return early if this message isn't meant for the offscreen document.
    if (message.target !== SEND_MESSAGE_TARGET_FETCH_OFFSCREEN_RESPONSE_HANDLER) {
      console.debug("ResponseFetchOffscreenService: received message not specific to the service worker fetch offscreen response handler.");
      return;
    }

    ResponseFetchOffscreenService.assertMessage(message);
    const {id, type, data} = message;
    const offscreenRequestPromiseCallbacks = ResponseFetchOffscreenService.consumeRequestPromiseCallbacksOrFail(id);

    if (type === FETCH_OFFSCREEN_RESPONSE_TYPE_SUCCESS) {
      offscreenRequestPromiseCallbacks.resolve(ResponseFetchOffscreenService.buildFetchResponse(data));
    } else if (type === FETCH_OFFSCREEN_RESPONSE_TYPE_ERROR) {
      offscreenRequestPromiseCallbacks.reject(new Error(data.message));
    }
  }

  /**
   * Assert message data.
   * @param {object} message The message.
   * @returns {void}
   * @throws {Error} If the message id is not a valid uuid.
   * @throws {Error} If the message data is not an object.
   * @throws {Error} If the message type is not valid.
   */
  static assertMessage(message) {
    // console.log(message);
    const FETCH_OFFSCREEN_RESPONSE_TYPES = [FETCH_OFFSCREEN_RESPONSE_TYPE_SUCCESS, FETCH_OFFSCREEN_RESPONSE_TYPE_ERROR];

    if (!FETCH_OFFSCREEN_RESPONSE_TYPES.includes(message?.type)) {
      throw new Error(`ResponseFetchOffscreenService: message.type should be one of the following ${FETCH_OFFSCREEN_RESPONSE_TYPES.join(", ")}.`);
    }
    assertUuid(message?.id, "ResponseFetchOffscreenService: message.id should be a valid uuid.");
    if (!(message?.data instanceof Object)) {
      throw new Error("ResponseFetchOffscreenService: message.data should be an object.");
    }
  }

  /**
   * Consume the offscreen request promise callbacks or fail.
   * @param {string} id The identifier of the offscreen fetch request.
   * @returns {object}
   * @throws {Error} If no request promise callbacks can be found for the given offscreen fetch request id.
   */
  static consumeRequestPromiseCallbacksOrFail(id) {
    const offscreenRequestPromiseCallback = RequestFetchOffscreenService.offscreenRequestsPromisesCallbacks[id];
    if (!offscreenRequestPromiseCallback) {
      throw new Error("ResponseFetchOffscreenService: No request promise callbacks found for the given offscreen fetch request id.");
    }
    delete RequestFetchOffscreenService.offscreenRequestsPromisesCallbacks[id];

    return offscreenRequestPromiseCallback;
  }

  /**
   * Build native fetch response object based on offscreen message response data.
   * @param {object} data The fetch offscreen message response data.
   * @returns {Response}
   */
  static buildFetchResponse(data) {
    return new Response(data.text, {
      status: data.status,
      statusText: data.statusText,
      headers: data.headers,
      redirected: data.redirected,
      url: data.url,
      ok: data.ok,
    });
  }
}
