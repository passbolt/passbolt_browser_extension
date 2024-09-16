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
 * @since         4.9.4
 */
import ResourceService from "../api/resource/resourceService";
import ResourceLocalStorage from "../local_storage/resourceLocalStorage";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import ResourceTypeModel from "../../model/resourceType/resourceTypeModel";

/**
 * The service aims to find resources from the API.
 */
export default class FindResourcesService {
  /**
   *
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.resourceService = new ResourceService(apiClientOptions);
    this.resourceTypeModel = new ResourceTypeModel(apiClientOptions);
  }

  /**
   * Find all
   *
   * @param {Object} [contains] optional example: {permissions: true}
   * @param {Object} [filters] optional
   * @param {boolean?} [ignoreInvalidEntity] Should invalid entities be ignored.
   * @returns {Promise<ResourcesCollection>}
   */
  async findAll(contains, filters, ignoreInvalidEntity) {
    //Assert contains
    const supportedOptions = ResourceService.getSupportedContainOptions();
    const supportedFilter = ResourceService.getSupportedFiltersOptions();

    if (contains && !Object.keys(contains).every(option => supportedOptions.includes(option))) {
      throw new Error("Unsupported contains parameter used, please check supported contains");
    }

    if (filters && !Object.keys(filters).every(filter => supportedFilter.includes(filter))) {
      throw new Error("Unsupported filter parameter used, please check supported filters");
    }

    const resourcesDto = await this.resourceService.findAll(contains, filters);
    return new ResourcesCollection(resourcesDto, {clone: false, ignoreInvalidEntity: ignoreInvalidEntity});
  }

  /**
   * Retrieve all resources for the local storage.
   * @returns {Promise<ResourcesCollection>}
   */
  async findAllForLocalStorage() {
    const resources = await this.findAll(ResourceLocalStorage.DEFAULT_CONTAIN, null, true);
    const resourceTypes = await this.resourceTypeModel.getOrFindAll();
    resources.filterByResourceTypes(resourceTypes);
    return resources;
  }
}
