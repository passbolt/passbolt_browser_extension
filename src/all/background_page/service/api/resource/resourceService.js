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

const RESOURCE_SERVICE_RESOURCE_NAME = 'resources';

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
      'creator',
      'favorite',
      'modifier',
      'secret',
      'permission',
      // find all
      'permissions.user.profile',
      'permissions.group',
      // if tag plugin
      'tag',
      // resource types - since v3
      'resource-type'
    ];
  }

  /**
   * Return the list of supported filters for in API find operations
   *
   * @returns {Array<string>} list of supported option
   */
  static getSupportedFiltersOptions() {
    return [
      'is-favorite',
      'is-shared-with-group',
      'is-owned-by-me',
      'is-shared-with-me',
      'has-id',
      // if tag plugin
      'has-tag',
    ];
  }

  /**
   * Return the list of supported orders for in API find operations
   *
   * @returns {Array<string>} list of supported option
   */
  static getSupportedOrdersOptions() {
    return [
      'Resource.modified DESC',
      'Resource.modified ASC',
    ];
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
   * @param {Object} [orders] optional
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async findAll(contains, filters, orders) {
    contains = contains ? this.formatContainOptions(contains, ResourceService.getSupportedContainOptions()) : null;
    filters = filters ? this.formatFilterOptions(filters, ResourceService.getSupportedFiltersOptions()) : null;
    orders = orders ? this.formatOrderOptions(orders, ResourceService.getSupportedFiltersOptions()) : null;
    const options = {...contains, ...filters, ...orders};
    const response = await this.apiClient.findAll(options);
    if (!response.body || !response.body.length) {
      return [];
    }
    return response.body;
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

  /**
   * Find resources to share
   * @param {array} resourcesIds
   * @returns {Promise<*>} Response body
   * @public
   * @todo should be replaced by a findAll, see how the find all for resources export works.
   */
  async findAllForShare(resourcesIds) {
    // Retrieve by batch to avoid any 414 response.
    const batchSize = 80;
    if (resourcesIds.length > batchSize) {
      let resources = [];
      const totalBatches = Math.ceil(resourcesIds.length / batchSize);
      for (let i = 0; i < totalBatches; i++) {
        const resourcesIdsPart = resourcesIds.splice(0, batchSize);
        const resourcesPart = await this.findAllForShare(resourcesIdsPart);
        resources = [...resources, ...resourcesPart];
      }

      return resources;
    }

    const url = this.apiClient.buildUrl(this.apiClient.baseUrl.toString());
    resourcesIds.forEach(resourceId => {
      url.searchParams.append(`filter[has-id][]`, resourceId);
    });
    url.searchParams.append('contain[permission]', '1');
    url.searchParams.append('contain[permissions.user.profile]', '1');
    url.searchParams.append('contain[permissions.group]', '1');
    url.searchParams.append('contain[secret]', '1');

    const response = await this.apiClient.fetchAndHandleResponse('GET', url);
    return response.body;
  }
}

export default ResourceService;
