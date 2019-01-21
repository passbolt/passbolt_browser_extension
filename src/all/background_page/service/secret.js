/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.7.0
 */
const __ = require('../sdk/l10n').get;
const PassboltApiFetchError = require('../error/passboltApiFetchError').PassboltApiFetchError;
const User = require('../model/user').User;

class SecretService {}

/**
 * Find a secret by resource id.
 * @param {string} keywords The keywords to search
 * @returns {array}
 * Return users or groups objects.
 */
SecretService.findByResourceId = async function (resourceId) {
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
  const url = new URL(`${domain}/secrets/resource/${resourceId}.json?api-version=2`);
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
    throw new PassboltApiFetchError(response.statusText, {code: response.status});
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

exports.SecretService = SecretService;
