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
import ResourceLocalStorage from "../local_storage/resourceLocalStorage";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import FindAndUpdateResourcesLocalStorage from "./findAndUpdateResourcesLocalStorageService";
import ResourceTypeModel from "../../model/resourceType/resourceTypeModel";

/**
 * The service aims to get resources from the local storage if it is set, or retrieve them from the API and
 * set the local storage.
 */
export default class GetOrFindResourcesService {
  /**
   *
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.resourceTypeModel = new ResourceTypeModel(apiClientOptions);
    this.findAndUpdateResourcesLocalStorage = new FindAndUpdateResourcesLocalStorage(account, apiClientOptions);
  }

  /**
   * Get or find all the resources.
   * @returns {Promise<ResourcesCollection>}
   */
  async getOrFindAll() {
    const hasRuntimeCache = ResourceLocalStorage.hasCachedData();
    const resourcesDto = await ResourceLocalStorage.get();
    // Return local storage data if the storage was initialized.
    if (resourcesDto) {
      // No validation if data were in runtime cache, they were validate by the one which set it.
      return new ResourcesCollection(resourcesDto, {validate: !hasRuntimeCache});
    }

    // Otherwise retrieve the resources and update the local storage.
    const resourcesCollection = await this.findAndUpdateResourcesLocalStorage.findAndUpdateAll();

    // Validation is not necessary has the data have been refreshed in the runtime cache and validated by the update all.
    return resourcesCollection;
  }

  /**
   * Returns the possible resources to suggest given an url.
   * @param {string} url The url to suggest for.
   * @return {Promise<ResourcesCollection>}
   */
  async getOrFindSuggested(url) {
    if (!url) {
      return new ResourcesCollection([]);
    }

    const resourcesCollection = await this.getOrFindAll();

    // Filter by resource types behaving as a password.
    const resourceTypesCollection = await this.resourceTypeModel.getOrFindAll();
    resourceTypesCollection.filterByPasswordResourceTypes();
    resourcesCollection.filterByResourceTypes(resourceTypesCollection);

    // Filter by suggested resources.
    resourcesCollection.filterBySuggestResources(url);

    return resourcesCollection;
  }
}
