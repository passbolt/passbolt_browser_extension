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
 * @since         5.7.0
 */

const { default: FormDataUtils } = require("../../../all/background_page/utils/format/formDataUtils");
const { CookiesService } = require("../../background_page/service/cookies/cookiesService");
const { SendNativeMessageService } = require("../../background_page/service/nativeMessage/sendNativeMessageService");

class FetchSafariPolyfill {
  /**
   * Fetch external service through native messaging.
   * @param {string} resource The fetch url resource, similar to the native fetch resource parameter.
   * @param {object} options The fetch options, similar to the native fetch option parameter.
   * @returns {Promise<Response>}
   */
  static async fetch(resource, options) {
    // Get the current profile's cookie store ID for proper Safari profile isolation
    const storeId = await FetchSafariPolyfill.getCurrentCookieStoreId();
    const cookieService = new CookiesService(resource, storeId);
    const requestOptions = await FetchSafariPolyfill.prepareOptions(options, cookieService);

    const appResponse = await SendNativeMessageService.sendNativeMessage("fetch", {
      resource: resource,
      options: requestOptions,
    });
    const fetchResponse = await FetchSafariPolyfill.getProcessedAppResponse(appResponse, cookieService);

    return fetchResponse;
  }

  /**
   * Get the cookie store ID for the current Safari profile.
   * Safari 17+ uses separate cookie stores for each profile.
   * @returns {Promise<string>} The cookie store ID
   * @throws {Error} If no valid cookie store can be determined
   * @private
   */
  static async getCurrentCookieStoreId() {
    const stores = await chrome.cookies.getAllCookieStores();

    if (!stores || stores.length === 0) {
      throw new Error("No cookie stores available for Safari profile isolation");
    }

    // Find the store associated with the current tab
    const currentTabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (currentTabs?.length > 0) {
      const currentTabId = currentTabs[0].id;
      const matchingStore = stores.find((store) => store.tabIds?.includes(currentTabId));
      if (matchingStore) {
        return matchingStore.id;
      }
    }

    // SECURITY: Don't guess - fail if we can't determine the correct store
    throw new Error("Could not determine correct cookie store for current Safari profile");
  }

  /**
   * Prepare options to process the fetch on the Safari Application side.
   * @param {Object} options the base options object from the original fetch
   * @param {CookiesService} cookiesService the cookiesService
   * @returns {Promise<Object>} the options set for the Safari Application
   * @private
   */
  static async prepareOptions(options, cookieService) {
    const bodyData =
      options.body instanceof FormData ? await FormDataUtils.formDataToArray(options.body) : options.body;

    const requestOptions = { ...options, body: bodyData };

    if (options.credentials === "include") {
      requestOptions.cookies = await cookieService.getSerialisedCookies();
      requestOptions.headers["X-Csrf-Token"] = await cookieService.getCsrfToken();
    }

    requestOptions.headers["User-Agent"] = navigator.userAgent;

    return requestOptions;
  }

  /**
   * Process the answer from the Safari application and format it to be compatible with the extension.
   * @param {Object} appResponse the response from the Safari application
   * @param {CookiesService} cookiesService the cookiesService
   * @returns {Promise<Response>}
   * @private
   */
  static async getProcessedAppResponse(appResponse, cookieService) {
    const { headers, body, status } = appResponse.httpResponse;
    const httpHeaders = { ...headers };

    httpHeaders.statusText = httpHeaders.status;
    httpHeaders.status = status;

    if (httpHeaders["Set-Cookie"]) {
      await cookieService.updateCookiesWithSetCookieHeader(httpHeaders["Set-Cookie"]);
    }

    const httpResponse = new Response(JSON.stringify(body), httpHeaders);

    for (const key in headers) {
      httpResponse.headers.append(key, headers[key].toString());
    }

    return httpResponse;
  }
}

module.exports = (resource, options) => FetchSafariPolyfill.fetch(resource, options);
