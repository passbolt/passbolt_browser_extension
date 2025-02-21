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
import PassboltResponseEntity from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity";
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import {assertUuid} from "../../../utils/assertions";

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
   * Return the list of supported options for the contains option in API find operations
   *
   * @returns {Array<string>} list of supported option
   */
  static getSupportedContainOptions() {
    return [
      'resources_count',
    ];
  }

  /**
   * Return the list of supported filters for in API find operations
   *
   * @returns {Array<string>} list of supported option
   */
  static getSupportedFiltersOptions() {
    return [
      'is-deleted',
    ];
  }

  /**
   * Find all resources types
   *
   * @returns {Promise<>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async findAll(contain = {}, filters = {}) {
    contain = filters ? this.formatContainOptions(contain, ResourceTypeService.getSupportedContainOptions()) : null;
    filters = filters ? this.formatFilterOptions(filters, ResourceTypeService.getSupportedFiltersOptions()) : null;
    const options = {...contain, ...filters};

    const response = new PassboltResponseEntity(await this.apiClient.findAll(options));
    return response.body;
  }

  /**
   * Find all resources types (deleted and non deleted)
   *
   * @returns {Promise<ResourceTypesCollection>} response body
   * @public
   */
  async findAllByDeletedAndNonDeleted() {
    const contain = {resources_count: true};
    const deletedResourcesType = await this.findAll(contain, {['is-deleted']: true});
    const activeResourcesType = await this.findAll(contain);

    return new ResourceTypesCollection([...activeResourcesType, ...deletedResourcesType]);
  }

  /**
   * Undelete a resource type given its id.
   * @param {string} id
   * @returns {Promise<PassboltResponseEntity>}
   * @public
   */
  async undelete(id) {
    assertUuid(id, "The id of the resource type to activate should be a valid uuid.");
    const body = {deleted: null};
    const response = await this.apiClient.update(id, body);
    return new PassboltResponseEntity(response);
  }
}

export default ResourceTypeService;
