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
 * @since         5.13.0
 */
import FindAndUpdateGroupsLocalStorageService from "./findAndUpdateGroupsLocalStorageService";
import GroupLocalStorage from "../local_storage/groupLocalStorage";
import GroupsCollection from "passbolt-styleguide/src/shared/models/entity/group/groupsCollection";
import { assertArrayUUID } from "../../utils/assertions";

/**
 * The service aims to get groups from the local storage if it is set, or retrieve them from the API and
 * set the local storage.
 */
export default class GetOrFindGroupsService {
  /**
   *
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.groupLocalStorage = new GroupLocalStorage(account);
    this.findAndUpdateGroupsLocalStorage = new FindAndUpdateGroupsLocalStorageService(account, apiClientOptions);
  }

  /**
   * Get or find all groups.
   * @returns {Promise<GroupsCollection>}
   */
  async getOrFindAll() {
    const hasRuntimeCache = GroupLocalStorage.hasCachedData(this.account.id);
    const groupsDto = await this.groupLocalStorage.get();
    // Return local storage data if the storage was initialized.
    if (groupsDto) {
      // No validation is required if the data is in the runtime cache, as validation was done by the process that set the cache.
      return new GroupsCollection(groupsDto, { validate: !hasRuntimeCache });
    }

    // Otherwise retrieve the groups and update the local storage.
    return this.findAndUpdateGroupsLocalStorage.findAndUpdateAll();
  }

  /**
   * Get or find all the groups matching the given ids.
   * @param {Array<string>} groupIds The groups to find.
   * @return {Promise<GroupsCollection>}
   */
  async getOrFindByIds(groupIds) {
    assertArrayUUID(groupIds);

    const groupsCollection = await this.getOrFindAll();
    groupsCollection.filterByPropertyValueIn("id", groupIds);

    return groupsCollection;
  }
}
