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

const AUTH_VERIFY_SERVER_KEY_SERVICE_RESOURCE_NAME = 'auth/verify';

class AuthVerifyServerKeyService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, AuthVerifyServerKeyService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return AUTH_VERIFY_SERVER_KEY_SERVICE_RESOURCE_NAME;
  }

  /**
   * Retrieve the server key
   * @returns {Promise<{armored_key: string, fingerprint: string}>}
   */
  async getServerKey() {
    const response = await this.apiClient.findAll();
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
      fingerprint: fingerprint
    };
  }

  /**
   * Verify the server identify
   * @returns {Promise<any>}
   */
  async verify(fingerprint, serverVerifyToken) {
    const body = new FormData();
    body.append('data[gpg_auth][keyid]', fingerprint);
    body.append('data[gpg_auth][server_verify_token]', serverVerifyToken);
    const fetchOptions = await this.apiClient.buildFetchOptions();
    // It is required to let this property unset in order to let the browser determine it by itself and set the additional variable boundary required by the API to parse the payload.
    delete fetchOptions.headers['content-type'];
    const url = this.apiClient.buildUrl(this.apiClient.baseUrl.toString());
    const response = await this.apiClient.sendRequest('POST', url, body, fetchOptions);
    await this.apiClient.parseResponseJson(response);
    return response;
  }
}

export default AuthVerifyServerKeyService;
