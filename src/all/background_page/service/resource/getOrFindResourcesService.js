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
import UpdateResourcesLocalStorageService from "./updateResourcesLocalStorageService";

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
    this.updateResourcesLocalStorageService = new UpdateResourcesLocalStorageService(account, apiClientOptions);
  }

  /**
   * Get or find all the resources.
   * @returns {Promise<ResourcesCollection>}
   */
  async getOrFindAll() {
    const hasRuntimeCache = ResourceLocalStorage.hasCachedData();
    let resourcesDto = await ResourceLocalStorage.get();

    // Return local storage data if the storage was initialized.
    if (resourcesDto) {
      // No validation if data were in runtime cache, they were validate by the one which set it.
      return new ResourcesCollection(resourcesDto, {validate: !hasRuntimeCache});
    }

    // Otherwise retrieve the resources and update the local storage.
    await this.updateResourcesLocalStorageService.updateAll();
    resourcesDto = await ResourceLocalStorage.get();

    // Validation is not necessary has the data have been refreshed in the runtime cache and validated by the update all.
    return new ResourcesCollection(resourcesDto, {validate: false});
  }
}
