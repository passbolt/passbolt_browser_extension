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
 * @since         3.9.0
 */
import ApiClient from "../apiClient/apiClient";

const SSO_DRY_RUN_SERVICE_RESOURCE_NAME = '/sso/${providerId}/login/dry-run';

class SsoDryRunService {
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
    return SSO_DRY_RUN_SERVICE_RESOURCE_NAME;
  }

  /**
   * Get the SSO URL for the current draft settings
   * @param {string} providerId the identifier of the SSO provider to test
   * @param {object} dryRunDto the dry run data
   * @returns {Promise<SsoLoginUrlDto>}
   * @public
   */
  async getUrl(providerId, dryRunDto) {
    const response = await this.getApiClient(providerId).create(dryRunDto);
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

    const resourceName = SsoDryRunService.RESOURCE_NAME.replace("${providerId}", providerId);
    this.apiClientOptions.setResourceName(resourceName);
    return new ApiClient(this.apiClientOptions);
  }
}

export default SsoDryRunService;
