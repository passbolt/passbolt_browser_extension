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
 * @since         hackaton
 */

import AbstractService from "../api/abstract/abstractService";


const PASSWORD_POLICIES_SERVICE_RESOURCE_NAME = 'password-policies';

class PasswordPoliciesService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, PasswordPoliciesService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return PASSWORD_POLICIES_SERVICE_RESOURCE_NAME;
  }

  async find() {
    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/settings`);
    const setting = await this.apiClient.fetchAndHandleResponse('GET', url);
    return setting.body;
  }

  async findEntropy() {
    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/entropy/settings`);
    const setting = await this.apiClient.fetchAndHandleResponse('GET', url);
    return setting.body;
  }

  async create(passwordPoliciesDto) {
    if (!passwordPoliciesDto) {
      throw new TypeError(`Password policies creation failed, invalid policies data.`);
    }
    const bodyString = this.apiClient.buildBody(passwordPoliciesDto);
    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/settings`);
    const setting = await this.apiClient.fetchAndHandleResponse('POST', url, bodyString);
    return setting.body;
  }
}

export default PasswordPoliciesService;
