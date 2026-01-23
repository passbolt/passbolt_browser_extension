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

/**
 * Returns a cookie string with optional attributes
 * @param {string} name
 * @param {string} value
 * @param {object} [options = {}]
 * @param {boolean|string} [options.withPath = false]
 * @param {boolean|string} [options.withSecure = false]
 * @param {boolean|string} [options.withHttpOnly = false]
 * @param {boolean|string} [options.withSameSite = false]
 * @param {boolean|string} [options.withMaxAge = false]
 * @param {boolean|string} [options.withExpires = false]
 */
export const defaultCookieString = (name, value, options = {}) => {
  const cookieParts = [`${name}=${value}`];

  if (options.withPath) {
    const attribute = typeof options.withPath === "string" ? options.withPath : "/passbolt/";
    cookieParts.push(`Path=${attribute}`);
  }

  if (options.withSecure) {
    cookieParts.push(`Secure`);
  }

  if (options.withHttpOnly) {
    cookieParts.push(`HttpOnly`);
  }

  if (options.withExpires) {
    const attribute = typeof options.withExpires === "string" ? options.withExpires : "Thu, 01 Jan 1970 00:00:00 GMT";
    cookieParts.push(`Expires=${attribute}`);
  }

  if (options.withSameSite) {
    const attribute = typeof options.withSameSite === "string" ? options.withSameSite : "strict";
    cookieParts.push(`SameSite=${attribute}`);
  }

  if (options.withMaxAge) {
    const attribute = typeof options.withMaxAge === "string" ? options.withMaxAge : "0";
    cookieParts.push(`Max-Age=${attribute}`);
  }

  return cookieParts.join("; ");
};

export const simpleThemeCookie = (options = {}) => defaultCookieString("theme", "dark", options);
export const simpleSessionCookie = (options = {}) => defaultCookieString("session", "test-session", options);
export const fullThemeCookie = (options = {}) =>
  defaultCookieString("theme", "dark", {
    withPath: true,
    withExpires: true,
    withHttpOnly: true,
    withMaxAge: true,
    withSameSite: true,
    withSecure: true,
    ...options,
  });
export const fullSessionCookie = (options = {}) =>
  defaultCookieString("session", "test-session", {
    withPath: true,
    withExpires: true,
    withHttpOnly: true,
    withMaxAge: true,
    withSameSite: true,
    withSecure: true,
    ...options,
  });
