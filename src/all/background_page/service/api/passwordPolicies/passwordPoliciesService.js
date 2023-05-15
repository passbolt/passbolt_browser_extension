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
 * @since         v4.2.0
 */

import AbstractService from "../abstract/abstractService";

const PASSWORD_GENERATOR_RESOURCE_NAME = 'password-generator/settings';
const PASSWORD_POLICIES_RESOURCE_NAME = 'password-policies/settings';

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
   * Get settings for password-policies.
   * @returns {Promise<Object>} Response body
   * @public
   */
  async find() {
    try {
      const setting = await this.apiClient.findAll();
      return setting.body;
    } catch (error) {
      if (error?.data?.code === 404) {
        console.error("The endpoint `password-policies` cannot be find; Falling back to the deprecated endpoint.", error);
        return this.findLegacy();
      }
      throw error;
    }
  }

  /**
   * Get legacy password generator settings.
   * To be used only if the `password-settings` endpoint fails
   * @deprecated since 4.2.0
   * @private
   * @returns {Promise<Object>}
   */
  async findLegacy() {
    let baseUrl = this.apiClient.options.getBaseUrl().toString();
    if (!baseUrl.endsWith('/')) {
      baseUrl += '/';
    }
    const url = this.apiClient.buildUrl(`${baseUrl}${PASSWORD_GENERATOR_RESOURCE_NAME}`);
    const setting = await this.apiClient.fetchAndHandleResponse('GET', url);
    return setting.body;
  }

  /**
   * Create a password policies using Passbolt API
   * @param {Object} passwordPoliciesDto
   * @returns {Promise<object>} Response body
   * @throws {TypeError} if passwordPoliciesDto is empty
   * @public
   */
  async save(passwordPoliciesDto) {
    if (!passwordPoliciesDto) {
      throw new TypeError(`Password policies creation failed, invalid policies data.`);
    }
    const settings = await this.apiClient.create(passwordPoliciesDto);
    return settings.body;
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return PASSWORD_POLICIES_RESOURCE_NAME;
  }
}

export default PasswordPoliciesService;
