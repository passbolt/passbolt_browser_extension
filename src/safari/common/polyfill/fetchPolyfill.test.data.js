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
 * Build a default Safari app response
 * @param {object} data
 * @returns {object}
 */
export const defaultAppResponse = (data = {}) => ({
  success: true,
  httpResponse: {
    status: data?.status ?? 200,
    headers: {
      status: "OK",
      code: 200,
      "Content-Type": "application/json",
      ...data?.headers,
    },
    body: {
      header: { code: 200, message: "success" },
      body: { data: "test-data" },
      ...data?.body,
    },
  },
});

/**
 * Build app response with custom status
 * @param {number} code
 * @param {string} status
 * @returns {object}
 */
export const appResponseWithStatus = (code, status) =>
  defaultAppResponse({
    status: code,
    headers: { code, status },
    body: { header: { code } },
  });

/**
 * Build app response with custom body
 * @param {object} body
 * @returns {object}
 */
export const appResponseWithBody = (body) => defaultAppResponse({ body });

/**
 * Build app response with custom headers
 * @param {object} headers
 * @returns {object}
 */
export const appResponseWithHeaders = (headers) => defaultAppResponse({ headers });

/**
 * Build app response with Set-Cookie header
 * @returns {object}
 */
export const appResponseWithSetCookie = () =>
  appResponseWithHeaders({ "Set-Cookie": "session=abc123; Path=/; Secure" });

/**
 * Build default fetch options
 * @param {object} data
 * @returns {object}
 */
export const defaultFetchOptions = (data = {}) => ({
  method: "GET",
  headers: {},
  ...data,
});

/**
 * Build fetch options with credentials
 * @param {object} data
 * @returns {object}
 */
export const fetchOptionsWithCredentials = (data = {}) =>
  defaultFetchOptions({
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...data,
  });

/**
 * Build fetch options with FormData body
 * @returns {object}
 */
export const fetchOptionsWithFormData = () => {
  const formData = new FormData();
  formData.append("username", "test-user");
  formData.append("password", "test-password");
  return defaultFetchOptions({ method: "POST", body: formData });
};
