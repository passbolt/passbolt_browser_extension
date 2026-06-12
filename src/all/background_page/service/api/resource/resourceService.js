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

import PassboltResponseEntity from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity";
import AbstractService from "passbolt-styleguide/src/shared/services/api/abstract/abstractService";

const RESOURCE_SERVICE_RESOURCE_NAME = "resources";

class ResourceService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, ResourceService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return RESOURCE_SERVICE_RESOURCE_NAME;
  }

  /**
   * Return the list of supported options for the contains option in API find operations
   *
   * @returns {Array<string>} list of supported option
   */
  static getSupportedContainOptions() {
    return [
      // create
      "creator",
      "favorite",
      "modifier",
      "secret",
      "permission",
      // find all
      "permissions",
      "permissions.user.profile",
      "permissions.group",
      // if tag plugin
      "tag",
      // resource types - since v3
      "resource-type",
    ];
  }

  /**
   * Return the list of supported filters for in API find operations
   *
   * @returns {Array<string>} list of supported option
   */
  static getSupportedFiltersOptions() {
    return [
      "is-favorite",
      "is-shared-with-group",
      "is-owned-by-me",
      "is-shared-with-me",
      "has-id",
      // if tag plugin
      "has-tag",
      "has-parent",
    ];
  }

  /**
   * Return the list of supported orders for in API find operations
   *
   * @returns {Array<string>} list of supported option
   */
  static getSupportedSortsOptions() {
    return ["Resources.modified"];
  }

  /**
   * Get a resource for a given id
   *
   * @param {string} id resource uuid
   * @param {Object} [contains] optional example: {permissions: true}
   * @throws {Error} if API call fails, service unreachable, etc.
   * @throws {TypeError} if resource id is not a uuid
   * @returns {Object} resourceDto
   */
  async get(id, contains) {
    this.assertValidId(id);
    const options = contains ? this.formatContainOptions(contains, ResourceService.getSupportedContainOptions()) : null;
    const response = await this.apiClient.get(id, options);
    return response.body;
  }

  /**
   * Find all resources
   *
   * @param {Object} [contains] optional example: {permissions: true}
   * @param {Object} [filters] optional
   * @param {Object} [pageOptions] optional
   * @param {number} [pageOptions.page] optional
   * @param {number} [pageOptions.limit] optional
   * @param {Object} [pageOptions.sorts] optional
   * @param {Array<string>} [pageOptions.orders] optional
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async findAll(contains, filters, pageOptions) {
    contains = contains ? this.formatContainOptions(contains, ResourceService.getSupportedContainOptions()) : null;
    filters = filters ? this.formatFilterOptions(filters, ResourceService.getSupportedFiltersOptions()) : null;
    pageOptions = pageOptions ? this.formatPageOptions(pageOptions, ResourceService.getSupportedSortsOptions()) : null;

    const options = { ...contains, ...filters, ...pageOptions };
    const responseDto = await this.apiClient.findAll(options);

    const responseDtoBody = !responseDto.body || !responseDto.body.length ? [] : responseDto.body;
    return new PassboltResponseEntity({ header: responseDto.header, body: responseDtoBody });
  }

  /**
   * Create a resource using Passbolt API
   *
   * @param {Object} data
   * @param {Object} [contains] optional example: {permissions: true}
   * @returns {Promise<*>} Response body
   * @throws {TypeError} if resource id is not a uuid
   * @public
   */
  async create(data, contains) {
    this.assertNonEmptyData(data);
    const options = contains ? this.formatContainOptions(contains, ResourceService.getSupportedContainOptions()) : null;
    const response = await this.apiClient.create(data, options);
    return response.body;
  }

  /**
   * Update a resource using Passbolt API
   *
   * @param {String} resourceId uuid
   * @param {Object} resourceData
   * @param {Object} [contains] optional example: {permissions: true}
   * @returns {Promise<*>} Response body
   * @throws {TypeError} if resource id is not a uuid or data is empty
   * @public
   */
  async update(resourceId, resourceData, contains) {
    this.assertValidId(resourceId);
    this.assertNonEmptyData(resourceData);
    const options = contains ? this.formatContainOptions(contains, ResourceService.getSupportedContainOptions()) : null;
    const response = await this.apiClient.update(resourceId, resourceData, options);
    return response.body;
  }

  /**
   * Delete a resource using Passbolt API
   *
   * @param {string} resourceId uuid
   * @returns {Promise<*>} Response body
   * @public
   */
  async delete(resourceId) {
    this.assertValidId(resourceId);
    const response = await this.apiClient.delete(resourceId);
    return response.body;
  }
}

export default ResourceService;
