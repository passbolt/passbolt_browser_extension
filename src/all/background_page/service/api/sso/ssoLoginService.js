/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.0.0
 */
import ApiClient from "../apiClient/apiClient";

const SSO_USER_DATA_SERVICE_RESOURCE_NAME = '/sso/${providerId}/login';

class SsoLoginService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.apiClientOptions = apiClientOptions;
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return SSO_USER_DATA_SERVICE_RESOURCE_NAME;
  }

  /**
   * Get the login URL for the given user from the API.
   * @param {string} providerId the provider identifier
   * @param {GetLoginUrlDto} getLoginUrlDto
   * @returns {Promise<SsoLoginUrlDto>}
   */
  async getLoginUrl(providerId, getLoginUrlDto) {
    const response = await this.getApiClient(providerId).create(getLoginUrlDto);
    return response.body;
  }

  /**
   * Instanciate and return a new ApiClient with a ressource URL built from the provider id.
   * @param {string} providerId the provider identifier
   * @returns {ApiClient}
   * @private
   */
  getApiClient(providerId) {
    if (typeof(providerId) !== "string") {
      throw new Error("The provider identifier should be a string");
    }

    const resourceName = SsoLoginService.RESOURCE_NAME.replace("${providerId}", providerId);
    this.apiClientOptions.setResourceName(resourceName);
    return new ApiClient(this.apiClientOptions);
  }
}

export default SsoLoginService;
