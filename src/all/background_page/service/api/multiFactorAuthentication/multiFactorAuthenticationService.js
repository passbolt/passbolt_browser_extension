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
import AbstractService from "../abstract/abstractService";

const USER_SERVICE_RESOURCE_NAME = 'mfa';

class MultiFactorAuthenticationService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, MultiFactorAuthenticationService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return USER_SERVICE_RESOURCE_NAME;
  }

  /**
   * Disable mfa for a user using Passbolt API
   *
   * @param {string} userId uuid
   * @returns {Promise<*>} Response body
   * @throw {TypeError} if user id is not a valid uuid
   * @throw {ApiFetchError} if mfa for the user cannot be disabled
   * @public
   */
  async disableMfaForUser(userId) {
    this.assertValidId(userId);
    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/setup/${userId}`);
    return this.apiClient.fetchAndHandleResponse('DELETE', url);
  }

  /**
   * retrieve settings from the user
   *
   * @returns {Promise<*>} Response body
   * @throw {TypeError} if user id is not a valid uuid
   * @throw {ApiFetchError} if mfa for the user cannot be disabled
   * @public
   */
  async getSettings() {
    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/setup/select`);
    const settings = await this.apiClient.fetchAndHandleResponse('GET', url);
    return settings.body;
  }
}

export default MultiFactorAuthenticationService;
