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

const RESOURCE_TYPES_SERVICE_RESOURCE_NAME = 'resource-types';

class ResourceTypeService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, ResourceTypeService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return RESOURCE_TYPES_SERVICE_RESOURCE_NAME;
  }

  /**
   * Get a resource type for a given id
   *
   * @param {string} id resource type uuid
   * @throws {Error} if API call fails, service unreachable, etc.
   * @returns {Object} resourceTypeDto
   * @throws {TypeError} if resource type id is not a uuid
   */
  async get(id) {
    this.assertValidId(id);
    const response = await this.apiClient.get(id);
    return response.body;
  }

  /**
   * Find all resources types
   *
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async findAll() {
    const response = await this.apiClient.findAll();
    if (!response.body || !response.body.length) {
      return [];
    }
    return response.body;
  }
}

export default ResourceTypeService;
