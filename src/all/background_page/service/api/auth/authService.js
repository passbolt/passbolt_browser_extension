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
}

exports.AuthService = AuthService;
