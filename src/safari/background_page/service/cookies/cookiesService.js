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

import { assertNonEmptyString, assertString } from "../../../../all/background_page/utils/assertions";

const CSRF_TOKEN_COOKIE_NAME = "csrfToken";
const DEFAULT_COOKIE_VALUES = {
  sameSite: "no_restriction",
};

/**
 * Service to manage cookies for Safari needs
 */
export class CookiesService {
  /**
   * @constructor
   * @param {string} urlString the url string to derive the domain from.
   * @param {string} storeId Cookie store ID for profile isolation (Safari 17+)
   */
  constructor(urlString, storeId) {
    assertNonEmptyString(storeId, "The storeId is required for Safari profile isolation");
    const url = new URL(urlString);
    this.domain = url.hostname;
    this.url = `${url.protocol}//${url.host}${url.pathname}`;
    this.storeId = storeId;
  }

  /**
   * Get all the cookies available for the current domain in a HTTP header compatible format.
   * Uses storeId for proper Safari profile isolation.
   * @returns {Promise<string>}
   */
  async getSerialisedCookies() {
    const query = {
      domain: this.domain,
      storeId: this.storeId,
    };
    const cookies = await chrome.cookies.getAll(query);
    return this.serializeCookies(cookies);
  }

  /**
   * Update the current cookies set with a HTTP Cookie Header value sertialised string.
   * @param {string} setCookieHeaderValue
   */
  async updateCookiesWithSetCookieHeader(setCookieHeaderValue) {
    assertString(setCookieHeaderValue);

    await Promise.all(
      this.deserialisedCookie(setCookieHeaderValue).map((cookie) => {
        cookie.storeId = this.storeId;
        return chrome.cookies.set(cookie);
      }),
    );
  }

  /**
   * Returns the value of the CSRF token cookie.
   * Uses storeId for proper Safari profile isolation.
   * @returns {Promise<string|null>}
   */
  async getCsrfToken() {
    const query = {
      url: this.url,
      name: CSRF_TOKEN_COOKIE_NAME,
      storeId: this.storeId,
    };
    const cookie = await chrome.cookies.get(query);

    return cookie?.value || null;
  }

  /**
   * Serialises all the cookies for the current domain to be a string comptaible for HTTP header value.
   * @param {Array<Cookie>} cookies
   * @returns {string}
   * @private
   */
  serializeCookies(cookies) {
    return cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join(";");
  }

  /**
   * Deerialise a cookie string into an Array of Cookie compatible with the chrome.cookies API.
   * @param {string} cookieString
   * @returns {Array<Cookie>}
   * @private
   */
  deserialisedCookie(cookieString) {
    assertString(cookieString);
    const cookieList = this.splitMultiCookieString(cookieString);
    const cookies = [];
    for (let j = 0; j < cookieList.length; j++) {
      const cookieParts = cookieList[j].split(";");
      const [name, ...value] = cookieParts.shift().split("=");

      const cookie = {
        domain: this.domain,
        url: this.url,
        name: name.trim(),
        value: value.join("=").trim(),
      };

      for (let i = 0; i < cookieParts.length; i++) {
        let [key, ...value] = cookieParts[i].split("=");
        key = key.trim().toLowerCase();
        value = value?.join("=")?.trim();

        switch (key) {
          case "secure": {
            cookie.secure = true;
            break;
          }
          case "httponly": {
            cookie.httpOnly = true;
            break;
          }
          case "path": {
            cookie.path = cookie.path ?? value;
            break;
          }
          case "samesite": {
            const normalised = value?.toLowerCase() === "none" ? "no_restriction" : value?.toLowerCase();
            cookie.sameSite = cookie.sameSite ?? normalised;
            break;
          }
          case "max-age": {
            cookie.expirationDate = cookie.expirationDate ?? Math.floor(Date.now() / 1000) + parseInt(value, 10);
            break;
          }
          case "expires": {
            cookie.expirationDate = cookie.expirationDate ?? Math.floor(new Date(value).getTime() / 1000);
            break;
          }
        }
      }
      // the cookie API requires some defaults value for sameSite.
      cookies.push({ ...DEFAULT_COOKIE_VALUES, ...cookie });
    }
    return cookies;
  }

  /**
   * Split a combined Set-Cookie header string into individual cookie strings.
   * Handles commas in Expires dates (e.g., "Thu, 01 Jan 2027 00:00:00 GMT").
   * @param {string} multipleCookieString
   * @returns {Array<string>}
   * @private
   */
  splitMultiCookieString(multipleCookieString) {
    const cookieStrings = [];
    let currentCookie = "";
    let i = 0;

    while (i < multipleCookieString.length) {
      // Check for cookie boundary: ", " followed by a valid cookie name and "="
      if (multipleCookieString[i] === "," && multipleCookieString[i + 1] === " ") {
        const remainder = multipleCookieString.substring(i + 2);
        /*
         * Cookie names are tokens: alphanumeric plus - and _
         * Must be followed by = to be a new cookie (not a date continuation)
         */
        if (/^[\w-]+=/.test(remainder)) {
          cookieStrings.push(currentCookie.trim());
          currentCookie = "";
          i += 2; // Skip ", "
          continue;
        }
      }
      currentCookie += multipleCookieString[i];
      i++;
    }

    if (currentCookie.trim()) {
      cookieStrings.push(currentCookie.trim());
    }

    return cookieStrings;
  }
}
