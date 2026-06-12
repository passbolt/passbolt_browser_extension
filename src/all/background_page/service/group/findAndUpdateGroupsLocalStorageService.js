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
 * @since         5.7.0
 */
import GroupLocalStorage from "../local_storage/groupLocalStorage";
import FindGroupsService from "./findGroupsService";
import GroupApiService from "../api/group/groupApiService";
import GroupEntity from "passbolt-styleguide/src/shared/models/entity/group/groupEntity";
import GroupsCollection from "passbolt-styleguide/src/shared/models/entity/group/groupsCollection";
import { assertArrayUUID } from "../../utils/assertions";

const GROUPS_UPDATE_ALL_LS_LOCK_PREFIX = "GROUPS_UPDATE_LS_LOCK_";

/**
 * The service aim to find and update the resources local storage service.
 */
class FindAndUpdateGroupsLocalStorageService {
  /**
   * @constructor
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.groupLocalStorage = new GroupLocalStorage(account);
    this.findGroupsService = new FindGroupsService(apiClientOptions);
    this.groupApiService = new GroupApiService(apiClientOptions);
    this.lockKey = `${GROUPS_UPDATE_ALL_LS_LOCK_PREFIX}-${this.account.id}`;
  }

  /**
   * Update the groups local storage with the latest API
   *
   * @return {Promise<GroupsCollection>}
   * @public
   */
  async findAndUpdateAll() {
    return await navigator.locks.request(this.lockKey, { ifAvailable: true }, async (lock) => {
      // Lock not granted, an update is already in progress. Wait for its completion to notify the function consumer.
      if (!lock) {
        return await navigator.locks.request(this.lockKey, { mode: "shared" }, async () => {
          /*
           * Return the data from local storage while waiting for the update in progress.
           */
          const groupsDtos = await this.groupLocalStorage.get();
          return new GroupsCollection(groupsDtos, { validate: !GroupLocalStorage.hasCachedData(this.account.id) });
        });
      }

      // Lock is granted, retrieve all resources and update the local storage.
      const updatedResourcesCollection = await this.findGroupsService.findAllForLocalStorage();
      await this.groupLocalStorage.set(updatedResourcesCollection);

      // Return the updated resources collection from the API
      return updatedResourcesCollection;
    });
  }

  /**
   * Retrieve groups from local storage for the given ids.
   * If any requested group is missing from the local storage, the missing ones are fetched from the API,
   * added to the local storage, and included in the returned collection.
   *
   * @param {Array<string>} groupIds The ids of the groups to retrieve.
   * @returns {Promise<GroupsCollection>}
   * @public
   */
  async findForLocalStorageByIds(groupIds) {
    assertArrayUUID(groupIds);

    const groupsDtos = (await this.groupLocalStorage.get()) ?? [];
    const requestedIdsSet = new Set(groupIds);
    const collection = new GroupsCollection(
      groupsDtos.filter((dto) => requestedIdsSet.has(dto.id)),
      { validate: false },
    );

    if (collection.length === groupIds.length) {
      return collection;
    }

    // Missing groups need to be fetched from the API and stored.
    // Use a lock to prevent concurrent writes to the local storage.
    return await navigator.locks.request(this.lockKey, async () => {
      // Re-check local storage after acquiring the lock, as another concurrent
      // call may have already fetched and stored the missing groups.
      const refreshedGroupsDtos = (await this.groupLocalStorage.get()) ?? [];
      const refreshedCollection = new GroupsCollection(
        refreshedGroupsDtos.filter((dto) => requestedIdsSet.has(dto.id)),
        { validate: false },
      );

      if (refreshedCollection.length === groupIds.length) {
        return refreshedCollection;
      }

      const foundIdsSet = new Set(refreshedCollection.items.map((entity) => entity.id));
      const missingIds = groupIds.filter((id) => !foundIdsSet.has(id));
      const response = await this.groupApiService.findAll(GroupLocalStorage.DEFAULT_CONTAIN, { "has-id": missingIds });
      for (const groupDto of response.body ?? []) {
        const groupEntity = new GroupEntity(groupDto);
        await this.groupLocalStorage.addGroup(groupEntity);
        refreshedCollection.push(groupEntity);
      }

      return refreshedCollection;
    });
  }
}

export default FindAndUpdateGroupsLocalStorageService;
