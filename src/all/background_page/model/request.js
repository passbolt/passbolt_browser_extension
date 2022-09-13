/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SARL (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.4.0
 */
class Request { }

/**
 * Set a fetch request options CSRF header.
 * @param {object} fetchOptions The fetch options
 * @param {User} user The user who is at the origin of the request
 * @return {object} The updated fetch options
 */
Request.setCsrfHeader = function(fetchOptions, user) {
  fetchOptions = fetchOptions || {};
  const csrfToken = user.getCsrfToken();
  if (csrfToken) {
    Request.setHeader(fetchOptions, 'X-CSRF-Token', csrfToken);
  }
  return fetchOptions;
};

/**
 * Set a fetch request options header.
 * @param {object} fetchOptions The fetch options
 * @return {object} The updated fetch options
 */
Request.setHeader = function(fetchOptions, key, value) {
  fetchOptions = fetchOptions || {};
  fetchOptions.headers = fetchOptions.headers || {};
  fetchOptions.headers[key] = value;
  return fetchOptions;
};

export default Request;
