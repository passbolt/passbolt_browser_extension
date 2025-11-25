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
 * @since         5.8.0
 */
import RolesCollection from "passbolt-styleguide/src/shared/models/entity/role/rolesCollection";
import RolesLocalStorage from "../local_storage/rolesLocalStorage";
import FindAndUpdateRolesLocalStorage from "./findAndUpdateRolesLocalStorageService";

/**
 * The service aims to get roles from the local storage if it is set, or retrieve them from the API and
 * set the local storage.
 */
export default class GetOrFindRolesService {
  /**
   * @constructor
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.findAndUpdateRolesLocalStorage = new FindAndUpdateRolesLocalStorage(account, apiClientOptions);
  }

  /**
   * Get or find all the resources.
   * @returns {Promise<ResourcesCollection>}
   */
  async getOrFindAll() {
    const rolesDto = await RolesLocalStorage.get();
    // Return local storage data if the storage was initialized.
    if (rolesDto) {
      // No validation if data were in runtime cache, they were validate by the one which set it.
      return new RolesCollection(rolesDto);
    }

    // Otherwise retrieve the resources and update the local storage.
    const rolesCollection = await this.findAndUpdateRolesLocalStorage.findAndUpdateAll();

    // Validation is not necessary has the data have been refreshed in the runtime cache and validated by the update all.
    return rolesCollection;
  }
}
