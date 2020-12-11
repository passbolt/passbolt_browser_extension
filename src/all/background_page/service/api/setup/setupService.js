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
   * Complete a setup
   * @param {string} userId the user id
   * @param {object} completeDto The complete operation dto
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   */
  async complete(userId, completeDto) {
    this.assertValidId(userId);
    const url = new URL(`${this.apiClient.baseUrl}/complete/${userId}`);
    const bodyString = this.apiClient.buildBody(completeDto);
    return this.apiClient.fetchAndHandleResponse('POST', url, bodyString);
  }

  /**
   * Complete a recovery
   * @param {string} userId the user id
   * @param {object} completeDto The complete operation dto
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   */
  async completeRecovery(userId, completeDto) {
    this.assertValidId(userId);
    const url = new URL(`${this.apiClient.baseUrl}/completeRecovery/${userId}`);
    const bodyString = this.apiClient.buildBody(completeDto);
    return this.apiClient.fetchAndHandleResponse('POST', url, bodyString);
  }

  /**
   * Find the setup info
   * @param {string} userId the user id
   * @param {string} token the token
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   */
  async findSetupInfo(userId, token) {
    this.assertValidId(userId);
    this.assertValidId(token);
    const url = new URL(`${this.apiClient.baseUrl}/info/${userId}/${token}`);
    const response = await this.apiClient.fetchAndHandleResponse('GET', url);
    return response.body;
  }

  /**
   * Find the recover info
   * @param {string} userId the user id
   * @param {string} token the token
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   */
  async findRecoverInfo(userId, token) {
    this.assertValidId(userId);
    this.assertValidId(token);
    const url = new URL(`${this.apiClient.baseUrl}/recover/info/${userId}/${token}`);
    const response = await this.apiClient.fetchAndHandleResponse('GET', url);
    return response.body;
  }

  /**
   * Find legacy setup info.
   * @param {string} userId the user id
   * @param {string} token the token
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   * @deprecated will be removed with v4
   */
  async findLegacySetupInfo(userId, token) {
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

  /**
   * Find legacy recover info
   * @param {string} userId the user id
   * @param {string} token the token
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   */
  async findLegacyRecoverInfo(userId, token) {
    this.assertValidId(userId);
    this.assertValidId(token);

    const url = new URL(`${this.apiClient.baseUrl}/recover/${userId}/${token}`);
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
