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
 */
const {PassboltBadResponseError} = require("../../../error/passboltBadResponseError");
const {PassboltServiceUnavailableError} = require("../../../error/passboltServiceUnavailableError");
const {AbstractService} = require('../abstract/abstractService');

const SETUP_SERVICE_RESOURCE_NAME = 'setup';

class SetupService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, SetupService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return SETUP_SERVICE_RESOURCE_NAME;
  }

  /**
   * Find setup user legacy
   * @param {string} userId the user id
   * @param {string} token the token
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   */
  async findUserLegacy(userId, token) {
    this.assertValidId(userId);
    this.assertValidId(token);

    const url = new URL(`${this.apiClient.baseUrl}/install/${userId}/${token}`);
    let response, responseHtml, username, firstName, lastName;
    try {
      response = await fetch(url.toString());
    } catch (error) {
      // Catch Network error such as connection lost.
      throw new PassboltServiceUnavailableError(error.message);
    }

    try {
      responseHtml = await response.text();
      let parser = new DOMParser();
      let parsedHtml = parser.parseFromString(responseHtml, 'text/html');
      username = parsedHtml.getElementById('js_setup_user_username').value;
      firstName = parsedHtml.getElementById('js_setup_user_first_name').value;
      lastName = parsedHtml.getElementById('js_setup_user_last_name').value;
    } catch (error) {
      // If the response cannot be parsed, it's not a Passbolt API response.
      // It can be a for example a proxy timeout error (504).
      throw new PassboltBadResponseError();
    }

    return {
      username,
      profile: {
        first_name: firstName,
        last_name: lastName
      }
    };
  }
}

exports.SetupService = SetupService;
