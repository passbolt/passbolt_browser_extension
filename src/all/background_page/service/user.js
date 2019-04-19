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
 * @since         2.9.0
 */
const __ = require('../sdk/l10n').get;
const PassboltApiFetchError = require('../error/passboltApiFetchError').PassboltApiFetchError;
const PassboltServiceUnavailableError = require('../error/passboltServiceUnavailableError').PassboltServiceUnavailableError;

class UserService {}

/**
 * Retrieve the user csrf token
 * @param {User} user The user instance
 * @return {Promise<string>}
 */
UserService.retrieveCsrfToken = async function (user) {
  const url = `${user.settings.getDomain()}/users/recover`;
  const fetchOptions = {
    method: 'GET',
    credentials: 'include'
  };
  let response;

  try {
    response = await fetch(url, fetchOptions);
  } catch (error) {
    // Catch Network error such as connection lost.
    throw new PassboltServiceUnavailableError(error.message);
  }

  if (!response.ok) {
    const message = "Unexpected error";
    throw new PassboltApiFetchError(message, {
      code: response.status,
      body: responseJson.body
    });
  }

  const html = await response.text();
  const match = html.match(/_csrfToken.*value=\"(.*)\"/);

  if (!match[1]) {
    console.warn("CSRF token not found. Please upgrade your passbolt API.")
    return "";
  }

  if (!/^[a-z0-9]{128}$/.test(match[1])) {
    console.warn("CSRF token is not valid.")
    return "";
  }

  return match[1];
};

exports.UserService = UserService;
