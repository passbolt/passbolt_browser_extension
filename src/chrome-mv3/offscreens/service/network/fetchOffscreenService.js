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

import Validator from "validator";

export const SEND_MESSAGE_TARGET_FETCH_OFFSCREEN = "fetch-offscreen";
export const SEND_MESSAGE_TARGET_FETCH_OFFSCREEN_RESPONSE_HANDLER = "service-worker-fetch-offscreen-response-handler";
export const FETCH_OFFSCREEN_RESPONSE_TYPE_SUCCESS = "success";
export const FETCH_OFFSCREEN_RESPONSE_TYPE_ERROR = "error";

export default class FetchOffscreenService {
  /**
   * Handle fetch request.
   * @param {object} message Browser runtime.onMessage listener message.
   * @returns {Promise<void>}
   */
  static async handleFetchRequest(message) {
    // Return early if this message isn't meant for the offscreen document.
    if (message.target !== SEND_MESSAGE_TARGET_FETCH_OFFSCREEN) {
      console.debug("FetchOffscreenService received message not specific to offscreen.");
      return;
    }

    if (!(await FetchOffscreenService.validateMessageData(message.data))) {
      return;
    }
    const {id, resource, options} = message?.data || {};

    if (options.body) {
      /*
       * Using a binary buffer is necessary to make the `fetch` sending binary data.
       * Otherwise, files can't be sent properly as the body is encoded in a way that the data changes.
       * With the Uint8Array approach, the data remains unchanged during the transfer.
       */
      const uint8Array = new Uint8Array(options.body.length);
      for (let i = 0; i < uint8Array.length; i++) {
        uint8Array[i] = options.body.charCodeAt(i);
      }
      options.body = uint8Array;
    }

    try {
      const response = await fetch(resource, options);
      await FetchOffscreenService.handleSuccessResponse(id, response);
    } catch (error) {
      await FetchOffscreenService.handleErrorResponse(id, error);
    }
  }

  /**
   * Validate message data.
   * @param {object} messageData The message data
   * @returns {Promise<boolean>}
   */
  static async validateMessageData(messageData = {}) {
    let error;

    if (!messageData.id || !Validator.isUUID(messageData.id)) {
      error = new Error("FetchOffscreenService: message.id should be a valid uuid.");
    } else if (typeof messageData.resource !== "string") {
      error = new Error("FetchOffscreenService: message.resource should be a valid valid.");
    } else if (typeof messageData.options !== "undefined" && !(messageData.options instanceof Object)) {
      error = new Error("FetchOffscreenService: message.options should be an object.");
    }

    if (error) {
      await FetchOffscreenService.handleErrorResponse(messageData.id, error);
      return false;
    }

    return true;
  }

  /**
   * Handle fetch success, and send response to the service worker.
   * @param {string} id The fetch offscreen request id
   * @param {Response} response The fetch response
   * @returns {Promise<void>}
   */
  static async handleSuccessResponse(id, response) {
    await chrome.runtime.sendMessage({
      target: SEND_MESSAGE_TARGET_FETCH_OFFSCREEN_RESPONSE_HANDLER,
      id: id,
      type: FETCH_OFFSCREEN_RESPONSE_TYPE_SUCCESS,
      data: await FetchOffscreenService.serializeResponse(response)
    });
  }

  /**
   * Handle fetch error, and communicate it the service worker.
   * @param {string} id The fetch offscreen request id
   * @param {Error} error The fetch error
   * @returns {Promise<void>}
   */
  static async handleErrorResponse(id, error) {
    console.error(error);
    await chrome.runtime.sendMessage({
      target: SEND_MESSAGE_TARGET_FETCH_OFFSCREEN_RESPONSE_HANDLER,
      id: id,
      type: FETCH_OFFSCREEN_RESPONSE_TYPE_ERROR,
      data: {
        name: error?.name,
        message: error?.message || "FetchOffscreenService: an unexpected error occurred"
      }
    });
  }

  /**
   * Serialize the fetch response to return to the service worker.
   * @param {Response} response The response to serialize
   * @returns {Promise<object>}
   */
  static async serializeResponse(response) {
    return {
      status: response.status,
      statusText: response.statusText,
      headers: Array.from(response.headers.entries()),
      redirected: response.redirected,
      url: response.url,
      ok: response.ok,
      text: await response.text()
    };
  }
}
