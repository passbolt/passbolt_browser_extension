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
import AbstractService from "../abstract/abstractService";

const SSO_USER_DATA_SERVICE_RESOURCE_NAME = '/sso/azure/login';

class SsoAzureLoginService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, SsoAzureLoginService.RESOURCE_NAME);
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
   * @param {GetLoginUrlDto} getLoginUrlDto
   * @returns {Promise<SsoLoginUrlDto>}
   */
  async getLoginUrl(getLoginUrlDto) {
    const response = await this.apiClient.create(getLoginUrlDto);
    return response.body;
  }
}

export default SsoAzureLoginService;
