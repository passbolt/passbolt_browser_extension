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
 * @since         4.10.0
 */
import AbstractService from "../abstract/abstractService";

const SECRET_SERVICE_RESOURCE_NAME = 'secrets/resource';

class SecretService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, SecretService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return SECRET_SERVICE_RESOURCE_NAME;
  }

  /**
   * Find secret from a given resource id
   *
   * @param {string} id resource uuid
   * @throws {Error} if API call fails, service unreachable, etc.
   * @throws {TypeError} if resource id is not a uuid
   * @returns {Object} secretDto
   */
  async findByResourceId(id) {
    this.assertValidId(id);
    const response = await this.apiClient.get(id);
    return response.body;
  }
}

export default SecretService;
