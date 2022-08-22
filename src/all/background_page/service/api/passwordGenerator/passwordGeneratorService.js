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
 * @since         3.3.0
 */
import AbstractService from "../abstract/abstractService";

const PASSWORD_GENERATOR_SERVICE_RESOURCE_NAME = 'password-generator';

class PasswordGeneratorService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, PasswordGeneratorService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return PASSWORD_GENERATOR_SERVICE_RESOURCE_NAME;
  }

  /**
   * Find the password generator settings
   */
  async find() {
    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/settings`);
    const response = await this.apiClient.fetchAndHandleResponse('GET', url);
    return response.body;
  }
}

export default PasswordGeneratorService;
