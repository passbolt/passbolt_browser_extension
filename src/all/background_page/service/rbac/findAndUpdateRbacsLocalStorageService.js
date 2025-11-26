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
import RbacsLocalStorage from "../local_storage/rbacLocalStorage";
import RbacsCollection from "passbolt-styleguide/src/shared/models/entity/rbac/rbacsCollection";
import FindRbacService from "./findRbacService";

const FIND_AND_UPDATE_RBAC_LS_LOCK_PREFIX = "FIND_AND_UPDATE_RBAC_LS_LOCK-";

/**
 * The service aims to find Rbac from the API and store them in the local storage.
 */
export default class FindAndUpdateRbacLocalStorageService {
  /**
   * @constructor
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.findRbacService = new FindRbacService(account, apiClientOptions);
    this.rbacLocalStorage = new RbacsLocalStorage(account);
  }

  /**
   * Retrieve the rbacs collection from the API and store them in the local storage.
   * @returns {Promise<RbacsCollection>}
   */
  async findAndUpdateAll() {
    const lockKey = `${FIND_AND_UPDATE_RBAC_LS_LOCK_PREFIX}${this.account.id}`;

    // If no update is in progress, refresh the local storage.
    return await navigator.locks.request(lockKey, {ifAvailable: true}, async lock => {
      // Lock not granted, an update is already in progress. Wait for its completion and return the value of the local storage.
      if (!lock) {
        return await navigator.locks.request(lockKey, {mode: "shared"}, async() =>
          new RbacsCollection(await RbacsLocalStorage.get())
        );
      }

      // Lock is granted, retrieve the metadata types settings and update the local storage.
      const rbacsCollection = await this.findRbacService.findMe();

      await this.rbacLocalStorage.set(rbacsCollection);
      return rbacsCollection;
    });
  }
}
