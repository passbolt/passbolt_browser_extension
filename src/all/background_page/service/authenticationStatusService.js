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
import MfaAuthenticationRequiredError from "../error/mfaAuthenticationRequiredError";
import NotFoundError from "../error/notFoundError";
import PassboltBadResponseError from "../error/passboltBadResponseError";
import AbstractService from "passbolt-styleguide/src/shared/services/api/abstract/abstractService";

const AUTH_RESOURCE_NAME = "/auth";
const MFA_VERIFY_ERROR_REGEXP = /mfa\/verify\/error\.json$/;

class AuthenticationStatusService extends AbstractService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, AUTH_RESOURCE_NAME);
  }
  /**
   * Check if the current user is authenticated.
   * @returns {Promise<boolean>}
   * @throws {PassboltBadResponseError} If the response can't be parsed
   * @throws {MfaAuthenticationRequiredError} If there was an error during the MFA
   * @throws {NotFoundError} If the server answered with 404
   */
  async isAuthenticated() {
    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl.toString()}/is-authenticated`, null);

    const fetchOptions = {
      credentials: "include",
      headers: {
        Accept: "application/json",
        "content-type": "application/json",
      },
    };
    const response = await this.apiClient.sendRequest("GET", url, null, fetchOptions);

    let responseJson;
    try {
      //Get response on json format
      responseJson = await response.json();
    } catch (error) {
      console.error(error);
      // If the response cannot be parsed, it's not a Passbolt API response. It can be a nginx error (504).
      throw new PassboltBadResponseError();
    }

    if (response.ok) {
      return true;
    }

    // MFA required. @note: on safari response.url is an empty string in that case
    if (MFA_VERIFY_ERROR_REGEXP.test(responseJson.header.url) || MFA_VERIFY_ERROR_REGEXP.test(response.url)) {
      //Retrieve the message error details from json
      throw new MfaAuthenticationRequiredError(null, responseJson.body);
    } else if (response.status === 404) {
      // Entry point not found.
      throw new NotFoundError();
    }

    return false;
  }
}

export default AuthenticationStatusService;
