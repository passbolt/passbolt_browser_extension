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
const {AbstractService} = require('../abstract/abstractService');
const {PassboltApiFetchError} = require('../../../error/passboltApiFetchError');
const {PassboltBadResponseError} = require('../../../error/passboltBadResponseError');
const {PassboltServiceUnavailableError} = require('../../../error/passboltServiceUnavailableError');

const AUTH_SERVICE_RESOURCE_NAME = 'auth';

class AuthService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, AuthService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return AUTH_SERVICE_RESOURCE_NAME;
  }

  /**
   * Return the list of supported options for the contains option in API find operations
   *
   * @returns {Array<string>} list of supported option
   */
  static getSupportedContainOptions() {
    return [];
  }

  /**
   * Logout
   * @returns {Promise<void>}
   */
  async logout() {
    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/logout`, {});
    return this.apiClient.fetchAndHandleResponse('GET', url);
  }

  /**
   * Retrieve the server key
   * @returns {Promise<{armored_key: string, fingerprint: string}>}
   */
  async getServerKey() {
    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/verify`, {});
    const response = await this.apiClient.fetchAndHandleResponse('GET', url);
    return this.mapGetServerKey(response.body);
  }

  /**
   * Map the get server key result of the API.
   * @param data
   * @returns {{armored_key: string, fingerprint: string}}
   */
  mapGetServerKey(data) {
    const {keydata, fingerprint} = data;
    return {
      armored_key: keydata,
      fingerprint
    }
  }

  /**
   * Verify
   * @returns {Promise<void>}
   */
  async verify(fingerprint, serverVerifyToken) {
    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/verify`, {});

    const body = new FormData();
    body.append('data[gpg_auth][keyid]', fingerprint);
    body.append('data[gpg_auth][server_verify_token]', serverVerifyToken);

    const fetchOptions = this.apiClient.buildFetchOptions();
    fetchOptions.method = 'POST';
    fetchOptions.body = body;
    // It is required to let this property unset in order to let the browser determine it by itself and set the additional variable boundary required by the API to parse the payload.
    delete fetchOptions.headers['content-type'];

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
      // If the response cannot be parsed, it's not a Passbolt API response.
      // It can be a for example a proxy timeout error (504).
      throw new PassboltBadResponseError();
    }

    if (!response.ok) {
      const message = responseJson.header.message;
      throw new PassboltApiFetchError(message, {
        code: response.status,
        body: responseJson.body
      });
    }

    return response;
  }
}

exports.AuthService = AuthService;
