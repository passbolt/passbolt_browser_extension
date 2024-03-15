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
import PassboltBadResponseError from "../../../error/passboltBadResponseError";
import AbstractService from "../abstract/abstractService";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import PassboltServiceUnavailableError from "../../../error/passboltServiceUnavailableError";

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
      fingerprint: fingerprint
    };
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

    const fetchOptions = await this.apiClient.buildFetchOptions();
    fetchOptions.method = 'POST';
    fetchOptions.body = body;
    // It is required to let this property unset in order to let the browser determine it by itself and set the additional variable boundary required by the API to parse the payload.
    delete fetchOptions.headers['content-type'];

    let response, responseJson;
    try {
      response = await fetch(url.toString(), fetchOptions);
    } catch (error) {
      if (navigator.onLine) {
        // Catch Network error such as bad certificate or server unreachable.
        throw new PassboltServiceUnavailableError("Unable to reach the server, an unexpected error occurred");
      } else {
        // Network connection lost.
        throw new PassboltServiceUnavailableError("Unable to reach the server, you are not connected to the network");
      }
    }

    try {
      responseJson = await response.json();
    } catch (error) {
      /*
       * If the response cannot be parsed, it's not a Passbolt API response.
       * It can be a for example a proxy timeout error (504).
       */
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

export default AuthService;
