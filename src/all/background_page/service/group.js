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
 * @since         2.10.0
 */
const PassboltApiFetchError = require('../error/passboltApiFetchError').PassboltApiFetchError;
const PassboltBadResponseError = require('../error/passboltBadResponseError').PassboltBadResponseError;
const PassboltServiceUnavailableError = require('../error/passboltServiceUnavailableError').PassboltServiceUnavailableError;
const {User} = require('../model/user');

class GroupService {}

/**
 * Find all groups
 * @param {object} options Optional parameters
 * @returns {array} The list of groups
 */
GroupService.findAll = async function(options) {
  options = options || {};
  const user = User.getInstance();
  const domain = user.settings.getDomain();
  const fetchOptions = {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'content-type': 'application/json'
    }
  };
  const url = new URL(`${domain}/groups.json?api-version=2`);
  if (options.filter && options.filter.hasUsers) {
    options.filter.hasUsers.forEach(userId => {
      url.searchParams.append(`filter[has-users][]`, userId);
    });
  }
  let response, responseJson;

  try {
    response = await fetch(url.toString(), fetchOptions);
  } catch (error) {
    // Catch Network error such as connection lost.
    throw new PassboltServiceUnavailableError(error.message);
  }

  try {
    responseJson = await response.json();
  } catch (error) {
    // If the response cannot be parsed, it's not a Passbolt API response. It can be a nginx error (504).
    throw new PassboltBadResponseError();
  }

  if (!response.ok) {
    const message = responseJson.header.message;
    throw new PassboltApiFetchError(message, {
      code: response.status,
      body: responseJson.body
    });
  }

  return responseJson.body;
};

exports.GroupService = GroupService;
