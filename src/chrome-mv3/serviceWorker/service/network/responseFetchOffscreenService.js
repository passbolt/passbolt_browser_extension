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

import {
  FETCH_OFFSCREEN_RESPONSE_TYPE_ERROR,
  FETCH_OFFSCREEN_RESPONSE_TYPE_SUCCESS,
} from "../../../offscreens/service/network/fetchOffscreenService";

const FETCH_OFFSCREEN_RESPONSE_TYPES = [FETCH_OFFSCREEN_RESPONSE_TYPE_SUCCESS, FETCH_OFFSCREEN_RESPONSE_TYPE_ERROR];

export default class ResponseFetchOffscreenService {
  /**
   * Handle fetch offscreen response message.
   * @param {object} message The message itself.
   * @param {{resolve: function, reject: function}} message The message itself.
   * @return {void}
   */
  static handleFetchResponse(message, callbacks) {
    ResponseFetchOffscreenService.assertMessage(message);

    const {type, data} = message;

    if (type === FETCH_OFFSCREEN_RESPONSE_TYPE_SUCCESS) {
      callbacks.resolve(ResponseFetchOffscreenService.buildFetchResponse(data));
    } else {
      callbacks.reject(new Error(data.message));
    }
  }

  /**
   * Assert message data.
   * @param {object} message The message.
   * @throws {Error} If the message.data is not an object.
   * @throws {Error} If the message.type is not valid.
   * @private
   */
  static assertMessage(message) {
    if (!FETCH_OFFSCREEN_RESPONSE_TYPES.includes(message?.type)) {
      throw new Error(`ResponseFetchOffscreenService: message.type should be one of the following ${FETCH_OFFSCREEN_RESPONSE_TYPES.join(", ")}.`);
    }

    if (!(message?.data instanceof Object)) {
      throw new Error("ResponseFetchOffscreenService: message.data should be an object.");
    }
  }

  /**
   * Build native fetch response object based on offscreen message response data.
   * @param {object} data The fetch offscreen message response data.
   * @returns {Response}
   * @private
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
