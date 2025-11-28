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
import FindRolesService from "./findRolesService";

const FIND_AND_UPDATE_ROLES_LS_LOCK_PREFIX = "FIND_AND_UPDATE_ROLES_LS_LOCK-";

/**
 * The service aims to find roles from the API and store them in the local storage.
 */
export default class FindAndUpdateRolesLocalStorageService {
  /**
   * @constructor
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.findRolesService = new FindRolesService(account, apiClientOptions);
  }

  /**
   * Retrieve the metadata types settings from the API and store them in the local storage.
   * If the API does not already implement the metadata plugin, return the default v4 settings.
   * @returns {Promise<RolesCollection>}
   */
  async findAndUpdateAll() {
    const lockKey = `${FIND_AND_UPDATE_ROLES_LS_LOCK_PREFIX}${this.account.id}`;

    // If no update is in progress, refresh the local storage.
    return await navigator.locks.request(lockKey, {ifAvailable: true}, async lock => {
      // Lock not granted, an update is already in progress. Wait for its completion and return the value of the local storage.
      if (!lock) {
        return await navigator.locks.request(lockKey, {mode: "shared"}, async() =>
          new RolesCollection(await RolesLocalStorage.get())
        );
      }

      // Lock is granted, retrieve the metadata types settings and update the local storage.
      const rolesCollection = await this.findRolesService.findAll();

      await RolesLocalStorage.set(rolesCollection);
      return rolesCollection;
    });
  }
}
