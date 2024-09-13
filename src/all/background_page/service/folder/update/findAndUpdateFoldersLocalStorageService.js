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
import FindFoldersService from "../find/findFoldersService";
import {assertNumber} from "../../../utils/assertions";
import FolderLocalStorage from "../../local_storage/folderLocalStorage";
import FoldersCollection from "../../../model/entity/folder/foldersCollection";

const FOLDERS_UPDATE_ALL_LS_LOCK_PREFIX = 'FOLDERS_UPDATE_LS_LOCK_';

/**
 * The service aim to update the folders local storage service.
 */
class FindAndUpdateFoldersLocalStorageService {
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
    this.findFoldersServices = new FindFoldersService(apiClientOptions);
  }

  /**
   * Update the local storage with all the folders retrieved from the API.
   * @param {number} [updatePeriodThreshold] Do not update the local storage if the threshold is not overdue.
   * @return {Promise<FoldersCollection>}
   */
  async findAndUpdateAll({updatePeriodThreshold} = {}) {
    assertNumber(updatePeriodThreshold, "Parameter updatePeriodThreshold should be a number.");

    const lockKey = `${FOLDERS_UPDATE_ALL_LS_LOCK_PREFIX}${this.account.id}`;
    const lastUpdateTime = FindAndUpdateFoldersLocalStorageService.lastUpdateAllTimes[this.account.id] ?? null;
    const isRuntimeCacheInitialized = FolderLocalStorage.hasCachedData();
    const foldersDto = await FolderLocalStorage.get();

    // Do not update the storage if the defined period, during which the local storage doesn't need to be refreshed, has not yet passed.
    if (updatePeriodThreshold && lastUpdateTime && Boolean(foldersDto)) {
      if (Date.now() - lastUpdateTime < updatePeriodThreshold) {
        return new FoldersCollection(foldersDto, {validate: !isRuntimeCacheInitialized});
      }
    }

    // If no update is in progress, refresh the local storage.
    return await navigator.locks.request(lockKey, {ifAvailable: true}, async lock => {
      // Lock not granted, an update is already in progress. Wait for its completion to notify the function consumer.
      if (!lock) {
        return navigator.locks.request(lockKey, {mode: "shared"}, async() => new FoldersCollection(await FolderLocalStorage.get(), {validate: false}));
      }

      // Lock is granted, retrieve all folders and update the local storage.
      const foldersCollection = await this.findFoldersServices.findAllForLocalStorage();
      await FolderLocalStorage.set(foldersCollection);
      FindAndUpdateFoldersLocalStorageService.lastUpdateAllTimes[this.account.id] = Date.now();
      return foldersCollection;
    });
  }
}

export default FindAndUpdateFoldersLocalStorageService;
