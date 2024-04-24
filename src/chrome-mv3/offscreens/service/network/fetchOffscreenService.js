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
export const SEND_MESSAGE_TARGET_FETCH_OFFSCREEN_POLLING_HANDLER = "service-worker-fetch-offscreen-polling-handler";
export const FETCH_OFFSCREEN_RESPONSE_TYPE_SUCCESS = "success";
export const FETCH_OFFSCREEN_RESPONSE_TYPE_ERROR = "error";
const POLLING_COUNTER_UPDATE_LOCK = "POLLING_COUNTER_UPDATE_LOCK";
const POLLING_PERIOD = 25_000;

export default class FetchOffscreenService {
  /**
   * The count of pending request under fetch process.
   * It is used to know when to stop polling.
   * @type {number}
   * @private
   */
  static pendingRequestsCount = 0;

  /**
   * The 'interval' id of the current polling mechanism
   * @type {number|null}
   * @private
   */
  static pollingIntervalId = null;

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

    await FetchOffscreenService.increaseAwaitingRequests();
    try {
      const response = await fetch(resource, options);
      await FetchOffscreenService.handleSuccessResponse(id, response);
    } catch (error) {
      await FetchOffscreenService.handleErrorResponse(id, error);
    }
    await FetchOffscreenService.decreaseAwaitingRequests();
  }

  /**
   * Validate message data.
   * @param {object} messageData The message data
   * @returns {Promise<boolean>}
   */
  static async validateMessageData(messageData = {}) {
    let error;

    if (!messageData.id || typeof messageData.id !== "string" || !Validator.isUUID(messageData.id)) {
      error = new Error("FetchOffscreenService: message.id should be a valid uuid.");
    } else if (typeof messageData.resource !== "string") {
      error = new Error("FetchOffscreenService: message.resource should be a valid valid.");
    } else if (typeof messageData.options === "undefined" || !(messageData.options instanceof Object)) {
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

  /**
   * Increases the awaiting requests counter.
   * If the polling mechanism is not started, it starts it.
   * @return {Promise<void>}
   * @private
   */
  static increaseAwaitingRequests() {
    return navigator.locks.request(POLLING_COUNTER_UPDATE_LOCK, () => {
      FetchOffscreenService.pendingRequestsCount++;
      if (!FetchOffscreenService.pollingIntervalId) {
        FetchOffscreenService.pollingIntervalId = setInterval(FetchOffscreenService.pollServiceWorker, POLLING_PERIOD);
      }
    });
  }

  /**
   * Sends a message to the service worker to keep it awake.
   * This ensures that it is not stopped and will be awake to receive the fetch response as intended.
   *
   * @returns {Promise<void>}
   * @private
   */
  static async pollServiceWorker() {
    await chrome.runtime.sendMessage({
      target: SEND_MESSAGE_TARGET_FETCH_OFFSCREEN_POLLING_HANDLER,
    });
  }

  /**
   * Decreases the awaiting request counter.
   * If the counter reaches 0, then the polling mechanism is halted.
   * This method is meant to be called after a finished fetch (successful or not).
   *
   * @returns {Promise<void>}
   * @private
   */
  static async decreaseAwaitingRequests() {
    return navigator.locks.request(POLLING_COUNTER_UPDATE_LOCK, () => {
      FetchOffscreenService.pendingRequestsCount--;
      if (FetchOffscreenService.pendingRequestsCount === 0) {
        // there is no more pending request, halt the service worker polling
        clearInterval(FetchOffscreenService.pollingIntervalId);
        FetchOffscreenService.pollingIntervalId = null;
      }
    });
  }
}
