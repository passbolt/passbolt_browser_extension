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
import {
  FETCH_OFFSCREEN_DATA_TYPE_FORM_DATA,
  FETCH_OFFSCREEN_DATA_TYPE_JSON
} from "../../../offscreens/service/network/fetchOffscreenService";

const {SEND_MESSAGE_TARGET_FETCH_OFFSCREEN} = require("../../../offscreens/service/network/fetchOffscreenService");

export const IS_FETCH_OFFSCREEN_PREFERRED_STORAGE_KEY = "IS_FETCH_OFFSCREEN_PREFERRED_STORAGE_KEY";
const LOCK_CREATE_OFFSCREEN_FETCH_DOCUMENT = "LOCK_CREATE_OFFSCREEN_FETCH_DOCUMENT";
const FETCH_OFFSCREEN_DOCUMENT_REASON = "WORKERS";
const OFFSCREEN_URL = "offscreens/fetch.html";

export class RequestFetchOffscreenService {
  /**
   * Preferred strategy cache.
   * @type {boolean|null}
   */
  static isFetchOffscreenPreferredCache = null;

  /**
   * The stack of requests promises callbacks using the request id as reference.
   * @type {object}
   */
  static offscreenRequestsPromisesCallbacks = {};

  /**
   * Fetch external service through fetch offscreen document.
   * @param {string} resource The fetch url resource, similar to the native fetch resource parameter.
   * @param {object} options The fetch options, similar to the native fetch option parameter.
   * @returns {Promise<unknown>}
   */
  static async fetch(resource, options) {
    const fetchStrategy = await RequestFetchOffscreenService.isFetchOffscreenPreferred()
      ? RequestFetchOffscreenService.fetchOffscreen
      : RequestFetchOffscreenService.fetchNative;

    return fetchStrategy(resource, options);
  }

  /**
   * Check if the fetch offscreen strategy is preferred.
   * @returns {Promise<boolean>}
   */
  static async isFetchOffscreenPreferred() {
    if (RequestFetchOffscreenService.isFetchOffscreenPreferredCache === null) {
      const storageData = await browser.storage.session.get(IS_FETCH_OFFSCREEN_PREFERRED_STORAGE_KEY);
      RequestFetchOffscreenService.isFetchOffscreenPreferredCache = Boolean(storageData?.[IS_FETCH_OFFSCREEN_PREFERRED_STORAGE_KEY]);
    }

    return RequestFetchOffscreenService.isFetchOffscreenPreferredCache;
  }

  /**
   * Perform a fetch using the browser native API. Fallback on the offscreen fetch in case of unexpected error.
   * @param {string} resource The fetch url resource, similar to the native fetch resource parameter.
   * @param {object} options The fetch options, similar to the native fetch option parameter.
   * @returns {Promise<Response>}
   */
  static async fetchNative(resource, options) {
    try {
      return await fetch(resource, options);
    } catch (error) {
      // Let the fetch happen even if offline in case it requests a local url or a cache, however do not fallback on offscreen strategy in that case.
      if (!navigator.onLine) {
        throw new Error("RequestFetchOffscreenService::fetchNative: offline error.");
      }
      console.error("RequestFetchOffscreenService::fetchNative: An error occurred while using the native fetch API, fallback on offscreen strategy until browser restart.", error);
      RequestFetchOffscreenService.markFetchOffscreenStrategyAsPreferred();
      return await RequestFetchOffscreenService.fetchOffscreen(resource, options);
    }
  }

  /**
   * Perform a fetch using the offscreen API.
   * @param {string} resource The fetch url resource, similar to the native fetch resource parameter.
   * @param {object} options The fetch options, similar to the native fetch option parameter.
   * @returns {Promise<Response>}
   */
  static async fetchOffscreen(resource, options) {
    // Create offscreen document if it does not already exist.
    await navigator.locks.request(
      LOCK_CREATE_OFFSCREEN_FETCH_DOCUMENT,
      RequestFetchOffscreenService.createIfNotExistOffscreenDocument);

    const offscreenFetchId = crypto.randomUUID();
    const offscreenFetchData = await RequestFetchOffscreenService.buildOffscreenData(offscreenFetchId, resource, options);

    return new Promise((resolve, reject) => {
      // Stack the response listener callbacks.
      RequestFetchOffscreenService.offscreenRequestsPromisesCallbacks[offscreenFetchId] = {resolve, reject};
      return RequestFetchOffscreenService.sendOffscreenMessage(offscreenFetchData)
        .catch(reject);
    });
  }

  /**
   * Create fetch offscreen document if it does not exist yet.
   * @returns {Promise<void>}
   */
  static async createIfNotExistOffscreenDocument() {
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"],
      documentUrls: [chrome.runtime.getURL(OFFSCREEN_URL)]
    });

    if (existingContexts.length > 0) {
      return;
    }

    await chrome.offscreen.createDocument({
      url: OFFSCREEN_URL,
      reasons: [FETCH_OFFSCREEN_DOCUMENT_REASON],
      justification: "Used to perform fetch to services such as the passbolt API serving invalid certificate.",
    });
  }

  /**
   * Build offscreen message data.
   * @param {string} id The identifier of the offscreen fetch request.
   * @param {string} resource The fetch url resource, similar to the native fetch resource parameter.
   * @param {object} fetchOptions The fetch options, similar to the native fetch option parameter.
   * @returns {object}
   */
  static async buildOffscreenData(id, resource, fetchOptions = {}) {
    const options = JSON.parse(JSON.stringify(fetchOptions));

    // Format FormData fetch options to allow its serialization.
    if (fetchOptions?.body instanceof FormData) {
      const formDataSerialized = await FormDataUtils.formDataToArray(fetchOptions.body);
      options.body = {
        data: formDataSerialized,
        dataType: FETCH_OFFSCREEN_DATA_TYPE_FORM_DATA
      };
    } else {
      options.body = {
        data: fetchOptions.body,
        dataType: FETCH_OFFSCREEN_DATA_TYPE_JSON
      };
    }

    return {id, resource, options};
  }

  /**
   * Send message to the offscreen fetch document.
   * @param {object} offscreenData The offscreen message data.
   * @param {string} offscreenData.id The identifier of the offscreen fetch request.
   * @param {string} offscreenData.resource The fetch url resource, similar to the native fetch resource parameter.
   * @param {object} offscreenData.fetchOptions The fetch options, similar to the native fetch option parameter.
   * @returns {Promise<*>}
   */
  static async sendOffscreenMessage(offscreenData) {
    return chrome.runtime.sendMessage({
      target: SEND_MESSAGE_TARGET_FETCH_OFFSCREEN,
      data: offscreenData
    });
  }

  /**
   * Mark the fetch offscreen strategy as preferred.
   * return {Promise<void>}
   */
  static async markFetchOffscreenStrategyAsPreferred() {
    RequestFetchOffscreenService.isFetchOffscreenPreferredCache = true;
    await browser.storage.session.set({[IS_FETCH_OFFSCREEN_PREFERRED_STORAGE_KEY]: RequestFetchOffscreenService.isFetchOffscreenPreferredCache});
  }
}
