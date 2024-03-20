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
 * @since         4.7.0
 */
import AbstractService from "../abstract/abstractService";

const AUTH_LOGIN_SERVICE_RESOURCE_NAME = 'auth/login';

class AuthLoginService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, AuthLoginService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return AUTH_LOGIN_SERVICE_RESOURCE_NAME;
  }

  /**
   * GPGAuth stage1 - get and decrypt a verification given by the server
   *
   * @param {string} fingerprint The user fingerprint
   * @returns {Promise<*>} token
   */
  async loginStage1(fingerprint) {
    // Prepare request data
    const body = new FormData();
    body.append('data[gpg_auth][keyid]', fingerprint);
    const fetchOptions = await this.apiClient.buildFetchOptions();
    // It is required to let this property unset in order to let the browser determine it by itself and set the additional variable boundary required by the API to parse the payload.
    delete fetchOptions.headers['content-type'];
    const url = this.apiClient.buildUrl(this.apiClient.baseUrl.toString());
    // Send request token to the server
    const response = await this.apiClient.sendRequest('POST', url, body, fetchOptions);
    await this.apiClient.parseResponseJson(response);
    return response;
  }

  /**
   * Stage 2. send back the token to the server to get auth cookie
   *
   * @param userAuthToken {string} The user authentication token
   * @param {string} fingerprint The user fingerprint
   * @returns {Promise<*>}
   */
  async loginStage2(userAuthToken, fingerprint) {
    // Prepare request data
    const body = new FormData();
    body.append('data[gpg_auth][keyid]', fingerprint);
    body.append('data[gpg_auth][user_token_result]', userAuthToken);
    const fetchOptions = await this.apiClient.buildFetchOptions();
    // It is required to let this property unset in order to let the browser determine it by itself and set the additional variable boundary required by the API to parse the payload.
    delete fetchOptions.headers['content-type'];
    const url = this.apiClient.buildUrl(this.apiClient.baseUrl.toString());
    // Send request token to the server
    const response = await this.apiClient.sendRequest('POST', url, body, fetchOptions);
    await this.apiClient.parseResponseJson(response);
    return response;
  }
}

export default AuthLoginService;
