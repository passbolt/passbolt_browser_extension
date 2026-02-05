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
    const cookieService = new CookiesService(resource);
    const requestOptions = await FetchSafariPolyfill.prepareOptions(options, cookieService);

    const appResponse = await SendNativeMessageService.sendNativeMessage("fetch", {
      resource: resource,
      options: requestOptions,
    });
    const fetchResponse = await FetchSafariPolyfill.getProcessedAppResponse(appResponse, cookieService);

    return fetchResponse;
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
      options.body instanceof FormData ? await FormDataUtils.formDataToString(options.body) : options.body;

    const requestOptions = { ...options, body: bodyData };

    if (options.credentials === "include") {
      requestOptions.cookies = await cookieService.getSerialisedCookies();
      requestOptions.headers["X-Csrf-Token"] = await cookieService.getCsrfToken();
    }

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
