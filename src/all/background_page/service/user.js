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

  if (!match || !match[1]) {
    console.warn("CSRF token not found. Please upgrade your passbolt API.")
    return "";
  }

  if (!/^[a-z0-9]{128}$/.test(match[1])) {
    console.warn("CSRF token is not valid.")
    return "";
  }

  return match[1];
};

/**
 * Keep session alive by calling an endpoint
 *
 * @returns {boolean} true if session is active
 */
UserService.keepSessionAlive = async function (user) {
  const domain = user.settings.getDomain();
  const fetchOptions = {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'content-type': 'application/json'
    }
  };
  const url = new URL(`${domain}/users/me.json?api-version=2`);
  let response, responseJson;

  try {
    response = await fetch(url, fetchOptions);
  } catch (error) {
    // Catch Network error such as connection lost.
    throw new PassboltApiFetchError(error.message);
  }

  try {
    await response.json();
  } catch (error) {
    // If the response cannot be parsed, it's not a Passbolt API response. It can be a nginx error (504).
    throw new PassboltApiFetchError(response.statusText, {code: response.status});
  }

  return response.ok;
};

/**
 * Search users by keywords
 *
 * @param user current user
 * @param options
 * - keywords
 * - excludedUsers
 * @return {Promise.<array>} array of users
 */
UserService.searchUsers = async function (user, options) {
  let {keywords, excludedUsers} = options;
  const domain = user.settings.getDomain();
  const fetchOptions = {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'content-type': 'application/json'
    }
  };
  const url = new URL(`${domain}/users.json?api-version=v2`); // TODO use v2
  url.searchParams.append("filter[keywords]", htmlspecialchars(keywords, 'ENT_QUOTES'));
  url.searchParams.append("filter[is-active]", "1");

  let response, responseJson;

  try {
    response = await fetch(url, fetchOptions);
  } catch (error) {
    // Catch Network error such as connection lost.
    throw new PassboltApiFetchError(error.message);
  }

  try {
    responseJson = await response.json();
  } catch (error) {
    // If the response cannot be parsed, it's not a Passbolt API response. It can be a nginx error (504).
    throw new PassboltApiFetchError(response.statusText, { code: response.status });
  }

  if (!response.ok) {
    let message = __('Could not get the users. The server responded with an error.');
    message += ` (${responseJson.header.message}`;
    throw new PassboltApiFetchError(message, {
      code: response.status,
      body: responseJson.body
    });
  }

  // Build the user list
  const users = responseJson.body;
  let finalUsers = [];
  for (let i in users) {
    if (!in_array(users[i].id, excludedUsers)) {
      finalUsers.push(users[i]);
    }
  }
  return finalUsers;
};

exports.UserService = UserService;
