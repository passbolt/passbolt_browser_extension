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
 * @since         4.6.0
 */
import ResourceLocalStorage from "../local_storage/resourceLocalStorage";
import {assertNumber} from "../../utils/assertions";
import FindResourcesService from "./findResourcesService";

const RESOURCES_UPDATE_ALL_LS_LOCK_PREFIX = 'RESOURCES_UPDATE_LS_LOCK_';

/**
 * The service aim to update the resources local storage service.
 */
class UpdateResourcesLocalStorageService {
  /**
   * The last times the update all operation run, the object key represents the account id.
   * @type {object}
   * @private
   */
  static lastUpdateAllTimes = {};

  /**
   *
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.findResourcesServices = new FindResourcesService(account, apiClientOptions);
  }

  /**
   * Update the local storage with all the resources retrieved from the API.
   * @param {number} [updatePeriodThreshold] Do not update the local storage if the threshold is not overdue.
   * @return {Promise<void>}
   */
  async updateAll({updatePeriodThreshold} = {}) {
    assertNumber(updatePeriodThreshold, "Parameter forceUpdatePeriod should be a number.");

    const lockKey = `${RESOURCES_UPDATE_ALL_LS_LOCK_PREFIX}${this.account.id}`;
    const lastUpdateTime = UpdateResourcesLocalStorageService.lastUpdateAllTimes[this.account.id] ?? null;
    const isLocalStorageInitialized = ResourceLocalStorage.hasCachedData() || Boolean(await ResourceLocalStorage.get());

    // Do not update the storage if the defined period, during which the local storage doesn't need to be refreshed, has not yet passed.
    if (updatePeriodThreshold && lastUpdateTime && isLocalStorageInitialized) {
      if (Date.now() - lastUpdateTime < updatePeriodThreshold) {
        return;
      }
    }

    // If no update is in progress, refresh the local storage.
    return await navigator.locks.request(lockKey, {ifAvailable: true}, async lock => {
      // Lock not granted, an update is already in progress. Wait for its completion to notify the function consumer.
      if (!lock) {
        return navigator.locks.request(lockKey, {mode: "shared"}, () => {});
      }

      // Lock is granted, retrieve all resources and update the local storage.
      const resourcesCollection = await this.findResourcesServices.findAllForLocalStorage();
      await ResourceLocalStorage.set(resourcesCollection);
      UpdateResourcesLocalStorageService.lastUpdateAllTimes[this.account.id] = Date.now();
    });
  }
}

export default UpdateResourcesLocalStorageService;
