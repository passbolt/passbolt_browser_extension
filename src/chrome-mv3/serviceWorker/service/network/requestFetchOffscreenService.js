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
import CreateOffscreenDocumentService from "../offscreen/createOffscreenDocumentService";
import HandleOffscreenResponseService from "../offscreen/handleOffscreenResponseService";

const {SEND_MESSAGE_TARGET_FETCH_OFFSCREEN} = require("../../../offscreens/service/network/fetchOffscreenService");

export const IS_FETCH_OFFSCREEN_PREFERRED_STORAGE_KEY = "IS_FETCH_OFFSCREEN_PREFERRED_STORAGE_KEY";

export class RequestFetchOffscreenService {
  /**
   * Preferred strategy cache.
   * @type {boolean|null}
   * @private
   */
  static isFetchOffscreenPreferredCache = null;

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
   * @private
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
   * @private
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
   * @private
   */
  static async fetchOffscreen(resource, options) {
    await CreateOffscreenDocumentService.createIfNotExistOffscreenDocument();

    const requestId = crypto.randomUUID();
    const offscreenFetchData = await RequestFetchOffscreenService.buildOffscreenData(resource, options);

    return new Promise((resolve, reject) => {
      // Stack the response listener callbacks.
      HandleOffscreenResponseService.setResponseCallback(requestId, {resolve, reject});
      return RequestFetchOffscreenService.sendOffscreenMessage(requestId, offscreenFetchData)
        .catch(reject);
    });
  }

  /**
   * Build offscreen message data.
   * @param {string} resource The fetch url resource, similar to the native fetch resource parameter.
   * @param {object} [fetchOptions = {}] The fetch options, similar to the native fetch option parameter.
   * @returns {Promise<object>}
   * @private
   */
  static async buildOffscreenData(resource, fetchOptions = {}) {
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

    return {resource, options};
  }

  /**
   * Send message to the offscreen fetch document.
   * @param {string} id the identified of the request
   * @param {string} offscreenData.resource The fetch url resource, similar to the native fetch resource parameter.
   * @param {object} offscreenData.options The fetch options, similar to the native fetch option parameter.
   * @returns {Promise<void>}
   * @private
   */
  static async sendOffscreenMessage(id, data) {
    return chrome.runtime.sendMessage({
      id: id,
      data: data,
      target: SEND_MESSAGE_TARGET_FETCH_OFFSCREEN,
    });
  }

  /**
   * Mark the fetch offscreen strategy as preferred.
   * @returns {Promise<void>}
   * @private
   */
  static async markFetchOffscreenStrategyAsPreferred() {
    RequestFetchOffscreenService.isFetchOffscreenPreferredCache = true;
    await browser.storage.session.set({[IS_FETCH_OFFSCREEN_PREFERRED_STORAGE_KEY]: RequestFetchOffscreenService.isFetchOffscreenPreferredCache});
  }
}
