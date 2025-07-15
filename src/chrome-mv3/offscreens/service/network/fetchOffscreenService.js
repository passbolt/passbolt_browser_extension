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
import FormDataUtils from "../../../../all/background_page/utils/format/formDataUtils";

export const SEND_MESSAGE_TARGET_FETCH_OFFSCREEN = "fetch-offscreen";
export const SEND_MESSAGE_TARGET_FETCH_OFFSCREEN_RESPONSE_HANDLER = "service-worker-fetch-offscreen-response-handler";
export const SEND_MESSAGE_TARGET_FETCH_OFFSCREEN_POLLING_HANDLER = "service-worker-fetch-offscreen-polling-handler";
export const FETCH_OFFSCREEN_RESPONSE_TYPE_SUCCESS = "success";
export const FETCH_OFFSCREEN_RESPONSE_TYPE_ERROR = "error";
export const FETCH_OFFSCREEN_DATA_TYPE_JSON = "JSON";
export const FETCH_OFFSCREEN_DATA_TYPE_FORM_DATA = "FORM_DATA";
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
   * @param {string} id the request id.
   * @param {{resource: string, options: object}} data the fetch parameters
   * @returns {Promise<object>}
   */
  static async handleFetchRequest({resource, options}) {
    const validationErrors = FetchOffscreenService.validateMessageData(resource, options);
    if (validationErrors) {
      return validationErrors;
    }

    // Update the body to fit the data type to send (JSON or FORM DATA)
    options.body = options.body?.dataType === FETCH_OFFSCREEN_DATA_TYPE_JSON ? options.body.data : FormDataUtils.arrayToFormData(options.body.data);
    await FetchOffscreenService.increaseAwaitingRequests();
    try {
      const response = await fetch(resource, options);
      return await FetchOffscreenService.handleSuccessResponse(response);
    } catch (error) {
      console.log(error);
      return FetchOffscreenService.handleErrorResponse(error);
    } finally {
      await FetchOffscreenService.decreaseAwaitingRequests();
    }
  }

  /**
   * Validate message data.
   * @param {string} resource
   * @param {object} options
   * @returns {object|null}
   */
  static validateMessageData(resource, options) {
    let error;
    if (typeof resource !== "string") {
      error = new Error("FetchOffscreenService: message.resource should be a valid valid.");
    } else if (typeof options === "undefined" || !(options instanceof Object)) {
      error = new Error("FetchOffscreenService: message.options should be an object.");
    }

    if (error) {
      return FetchOffscreenService.handleErrorResponse(error);
    }

    return null;
  }

  /**
   * Handle fetch success, and send response to the service worker.
   * @param {Response} response The fetch response
   * @returns {Promise<void>}
   * @private
   */
  static async handleSuccessResponse(response) {
    return {
      data: await FetchOffscreenService.serializeResponse(response),
      type: FETCH_OFFSCREEN_RESPONSE_TYPE_SUCCESS,
      target: SEND_MESSAGE_TARGET_FETCH_OFFSCREEN_RESPONSE_HANDLER,
    };
  }

  /**
   * Handle fetch error, and communicate it the service worker.
   * @param {Error} error The fetch error
   * @returns {object}
   * @private
   */
  static handleErrorResponse(error) {
    console.error(error);
    return {
      data: {
        name: error?.name,
        message: error?.message || "FetchOffscreenService: an unexpected error occurred"
      },
      type: FETCH_OFFSCREEN_RESPONSE_TYPE_ERROR,
      target: SEND_MESSAGE_TARGET_FETCH_OFFSCREEN_RESPONSE_HANDLER,
    };
  }

  /**
   * Serialize the fetch response to return to the service worker.
   * @param {Response} response The response to serialize
   * @returns {Promise<object>}
   * @private
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
