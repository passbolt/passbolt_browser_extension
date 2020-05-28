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
 * @since         2.12.0
 */
const __ = require('../sdk/l10n').get;
const {PassboltApiFetchError} = require('../error/passboltApiFetchError');
const {PassboltBadResponseError} = require('../error/passboltBadResponseError');
const {PassboltServiceUnavailableError} = require('../error/passboltServiceUnavailableError');
const {Request} = require('../model/request');
const {User} = require('../model/user');

class FavoriteService {

  static async add(resourceId) {
    const user = User.getInstance();
    const domain = user.settings.getDomain();
    const fetchOptions = {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'content-type': 'application/json'
      }
    };
    Request.setCsrfHeader(fetchOptions, user);
    const url = new URL(`${domain}/favorites/resource/${resourceId}.json?api-version=2`);
    let response, responseJson;

    try {
      response = await fetch(url, fetchOptions);
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
  }

  static async delete(favoriteId) {
    const user = User.getInstance();
    const domain = user.settings.getDomain();
    const fetchOptions = {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'content-type': 'application/json'
      }
    };
    Request.setCsrfHeader(fetchOptions, user);
    const url = new URL(`${domain}/favorites/${favoriteId}.json?api-version=2`);
    let response, responseJson;

    try {
      response = await fetch(url, fetchOptions);
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
  }
}

exports.FavoriteService = FavoriteService;
