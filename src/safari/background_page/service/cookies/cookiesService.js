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

const CSRF_TOKEN_COOKIE_NAME = "csrfToken";

/**
 * Service to manage cookies for Safari needs
 */
export class CookiesService {
  /**
   * @constructor
   * @param {string} urlString the url string to derive the domain from.
   */
  constructor(urlString) {
    const url = new URL(urlString);
    this.domain = url.host;
    this.url = `${url.protocol}/${url.host}${url.pathname}`;
  }

  /**
   * Get all the cookies available for the current domain in a HTTP header compatible format
   * @returns {Promise<string>}
   */
  async getSerialisedCookies() {
    const cookies = await chrome.cookies.getAll({domain: this.domain});
    return this.serializeCookies(cookies);
  }

  /**
   * Update the current cookies set with a HTTP Cookie Header value sertialised string.
   * @param {string} setCookieHeaderValue
   */
  async updateCookiesWithSetCookieHeader(setCookieHeaderValue) {
    this
      .deserialisedCookie(setCookieHeaderValue)
      .forEach(cookie => chrome.cookies.set(cookie));
  }

  /**
   * Returns the value of the CSRF token cookie.
   * @returns {Promise<string|null>}
   */
  async getCsrfToken() {
    const cookie = await chrome.cookies.get({
      domain: this.domain,
      url: this.url,
      name: CSRF_TOKEN_COOKIE_NAME
    });

    return cookie?.value || null;
  }

  /**
   * Serialises all the cookies for the current domain to be a string comptaible for HTTP header value.
   * @param {Array<Cookie>} cookies
   * @returns {string}
   * @private
   */
  serializeCookies(cookies) {
    return cookies
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join(";");
  }

  /**
   * Deerialise a cookie string into an Array of Cookie compatible with the chrome.cookies API.
   * @param {string} cookieString
   * @returns {Array<Cookie>}
   * @private
   */
  deserialisedCookie(cookieString) {
    const cookieList = cookieString.split(",");
    const cookies = [];
    for (let j = 0; j < cookieList.length; j++) {
      const currentCookieString = cookieList[j].trim();
      const cookieParts = currentCookieString.split(";");
      const cookie = {
        domain: this.domain,
        url: this.url,
      };
      for (let i = 0; i < cookieParts.length; i++) {
        const part = cookieParts[i].trim();
        if (part.toLowerCase() === "secure") {
          cookie.secure = true;
        } else if (part.toLowerCase() === "httponly") {
          cookie.httpOnly = true;
        } else if (part.startsWith("path")) {
          cookie.path = part.substring(5);
        } else if (part.startsWith("SameSite")) {
          cookie.sameSite = part.substring(9).toLowerCase();
        } else if (part.startsWith('Max-Age')) {
          cookie.expirationDate = Date.now() + parseInt(part.substring(8), 10);
        } else if (part.startsWith('Expires') && !cookie.expirationDate) {
          cookie.expirationDate = Math.floor(new Date(part.substring(9)).getTime() / 1000);
        } else { // name=value
          const [name, value] = part.split("=");
          cookie.name = name;
          cookie.value = value;
        }
      }
      cookies.push(cookie);
    }
    return cookies;
  }
}
