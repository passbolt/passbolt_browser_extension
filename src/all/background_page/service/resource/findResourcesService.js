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
   * Retrieve all resources for the local storage.
   * @returns {Promise<ResourcesCollection>}
   */
  async findAllForLocalStorage() {
    // @todo E2EE should use findAll provided by this service.
    let resourcesDto = await this.resourceService.findAll(ResourceLocalStorage.DEFAULT_CONTAIN);
    const resourceTypes = await this.resourceTypeModel.getOrFindAll();
    // @todo E2EE sanitize should be done with ignore options when creating the collection.
    resourcesDto = ResourcesCollection.sanitizeDto(resourcesDto);
    const resources = new ResourcesCollection(resourcesDto, {clone: false});
    resources.filterByResourceTypes(resourceTypes);
    return resources;
  }
}
