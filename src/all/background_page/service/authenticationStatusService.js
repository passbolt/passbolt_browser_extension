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
 * @since         2.11.0
 */
import User from "../model/user";
import MfaAuthenticationRequiredError from "../error/mfaAuthenticationRequiredError";
import NotFoundError from "../error/notFoundError";
import {ApiClient} from "passbolt-styleguide/src/shared/lib/apiClient/apiClient";
import {ApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions";

const AUTH_RESOURCE_NAME = '/auth';

class AuthenticationStatusService {
  /**
   * Check if the current user is authenticated.
   * @returns {Promise<bool>}
   */
  static async isAuthenticated() {
    const apiClient = new ApiClient(this.apiClientOptions);
    const url = apiClient.buildUrl(`${apiClient.baseUrl.toString()}/is-authenticated`, null);

    const fetchOptions = {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'content-type': 'application/json'
      }
    };
    const response = await apiClient.sendRequest('GET', url, null, fetchOptions);

    if (response.ok) {
      return true;
    }

    const responseJson = await response.json();
    // MFA required.
    if (/mfa\/verify\/error\.json$/.test(response.url)) {
      //Retrieve the message error details from json
      throw new MfaAuthenticationRequiredError(null, responseJson.body);
    } else if (response.status === 404) {
      // Entry point not found.
      throw new NotFoundError();
    }

    return false;
  }

  /**
   * Return a built ApiClientOptions for requesting the API.
   * @returns {ApiClientOptions}
   * @private
   */
  static get apiClientOptions() {
    const domain = User.getInstance()?.settings?.getDomain();

    return new ApiClientOptions()
      .setBaseUrl(domain)
      .setResourceName(AUTH_RESOURCE_NAME);
  }
}

export default AuthenticationStatusService;
