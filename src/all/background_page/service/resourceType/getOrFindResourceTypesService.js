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
 * @since         6.0.0
 */
import ResourceTypeLocalStorage from "../local_storage/resourceTypeLocalStorage";
import ResourceTypeService from "../api/resourceType/resourceTypeService";
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";

/**
 * The service aims to get resource types from the local storage if it is set, or retrieve them from the API and
 * set the local storage.
 */
class GetOrFindResourceTypesService {
  /**
   * Constructor.
   * @param {AccountEntity} account The user account.
   * @param {ApiClientOptions} apiClientOptions The api client options.
   */
  constructor(account, apiClientOptions) {
    this.resourceTypeService = new ResourceTypeService(apiClientOptions);
    this.resourceTypeLocalStorage = new ResourceTypeLocalStorage(account);
  }

  /**
   * Get or find all resource types.
   * @returns {Promise<ResourceTypesCollection>}
   */
  async getOrFindAll() {
    const resourceTypesDto = await this.resourceTypeLocalStorage.getData();
    if (typeof resourceTypesDto !== "undefined") {
      return new ResourceTypesCollection(resourceTypesDto);
    }
    const resourceTypeDtos = await this.resourceTypeService.findAll();
    const resourceTypesCollection = new ResourceTypesCollection(resourceTypeDtos);
    await this.resourceTypeLocalStorage.setData(resourceTypesCollection);
    return resourceTypesCollection;
  }
}

export default GetOrFindResourceTypesService;
