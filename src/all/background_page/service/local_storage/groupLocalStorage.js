/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.13.0
 */
import Log from "../../model/log";
import GroupsCollection from "../../model/entity/group/groupsCollection";
import GroupEntity from "../../model/entity/group/groupEntity";
import AccountEntity from "../../model/entity/account/accountEntity";

export const GROUP_LOCAL_STORAGE_KEY = 'groups';

class GroupLocalStorage {
  /**
   * Runtime cached data.
   * @type {Object} Key: account_id, value: cached data as dto.
   * @private
   */
  static _runtimeCachedData = {};

  /**
   * Constructor
   * @param {AccountEntity} account the user account
   * @throws {TypeError} If parameter account is not of type AccountEntity.
   */
  constructor(account) {
    if (!account || !(account instanceof AccountEntity)) {
      throw new TypeError("Parameter `account` should be of type AccountEntity.");
    }
    this.account = account;
    this.storageKey = GroupLocalStorage.getStorageKey(account.id);
  }

  /**
   * Get the storage key.
   * @param {string} accountId The account to get the key for.
   * @returns {string}
   * @throws {Error} If it cannot retrieve account id.
   */
  static getStorageKey(accountId) {
    return `${GROUP_LOCAL_STORAGE_KEY}-${accountId}`;
  }

  /**
   * Check if there is cached data.
   * @param {string} accountId
   * @returns {boolean}
   */
  static hasCachedData(accountId) {
    return accountId in GroupLocalStorage._runtimeCachedData &&
      GroupLocalStorage._runtimeCachedData[accountId] &&
      Object.keys(GroupLocalStorage._runtimeCachedData[accountId]).length > 0;
  }

  /**
   * Flush the groups local storage
   *
   * @throws {Error} if operation failed
   * @return {Promise<void>}
   */
  async flush() {
    // Ensure the old key is deleted during the transition from local storage to local storage.
    await browser.storage.local.remove(GROUP_LOCAL_STORAGE_KEY);
    await browser.storage.local.remove(this.storageKey);
    delete GroupLocalStorage._runtimeCachedData[this.account.id];
    Log.write({level: 'debug', message: `GroupLocalStorage flushed for (${this.account.id})`});
  }

  /**
   * Get the groups from the local storage.
   *
   * @throws {Error} if operation failed
   * @return {Promise} results object, containing every object in keys that was found in the storage area.
   * If storage is not set, undefined will be returned.
   */
  async get() {
    // Check if data is available in the runtime cache
    if (GroupLocalStorage._runtimeCachedData[this.account.id]) {
      return GroupLocalStorage._runtimeCachedData[this.account.id];
    }

    // If not in memory, fetch from local storage
    const data = await browser.storage.local.get(this.storageKey);
    if (!data[this.storageKey]) {
      return;
    }

    // Update the runtime cache with the fetched data
    GroupLocalStorage._runtimeCachedData[this.account.id] = data[this.storageKey];

    return GroupLocalStorage._runtimeCachedData[this.account.id];
  }

  /**
   * Set the groups local storage.
   *
   * @param {GroupsCollection} groupsCollection The groups to insert in the local storage.
   * @return {Promise<void>}
   * @throws {TypeError} If parameter collection is not of type GroupsCollection.
   */
  async set(groupsCollection) {
    if (!groupsCollection || !(groupsCollection instanceof GroupsCollection)) {
      throw new TypeError("The parameter `groupsCollection` should be of type GroupsCollection.");
    }

    await navigator.locks.request(
      this.storageKey,
      async() => {
        for (const group of groupsCollection) {
          GroupLocalStorage.assertEntityBeforeSave(group);
        }
        const dtos = groupsCollection.toDto(GroupLocalStorage.DEFAULT_CONTAIN);
        await this._setBrowserStorage({[this.storageKey]: dtos});
        GroupLocalStorage._runtimeCachedData[this.account.id] = dtos;
      }
    );
  }

  /**
   * Get a group from the local storage by id
   *
   * @param {string} id The group id
   * @return {object} a group dto
   */
  async getGroupById(id) {
    const groups = await this.get();
    const groupInCache = groups.find(item => item.id === id);
    return groupInCache;
  }

  /**
   * Add a group in the local storage
   * @param {GroupEntity} groupEntity
   * @throws {TypeError} If parameter groupEntity is not of type GroupEntity.
   */
  async addGroup(groupEntity) {
    if (!groupEntity || !(groupEntity instanceof GroupEntity)) {
      throw new TypeError("The parameter `groupEntity` should be of type GroupEntity.");
    }

    await navigator.locks.request(this.storageKey, async() => {
      GroupLocalStorage.assertEntityBeforeSave(groupEntity);
      const groups = await this.get();
      const dtos = groupEntity.toDto(GroupLocalStorage.DEFAULT_CONTAIN);
      groups.push(dtos);
      await this._setBrowserStorage({[this.storageKey]: groups});
      GroupLocalStorage._runtimeCachedData[this.account.id] = groups;
    });
  }

  /**
   * Update a group in the local storage.
   *
   * @param {GroupEntity} groupEntity The group to update
   * @throws {TypeError} If parameter groupEntity is not of type GroupEntity.
   * @throws {Error} if the group does not exist in the local storage
   */
  async updateGroup(groupEntity) {
    if (!groupEntity || !(groupEntity instanceof GroupEntity)) {
      throw new TypeError("The parameter `groupEntity` should be of type GroupEntity.");
    }

    await navigator.locks.request(this.storageKey, async() => {
      GroupLocalStorage.assertEntityBeforeSave(groupEntity);
      const groups = await this.get();
      const groupIndex = groups.findIndex(item => item.id === groupEntity.id);
      if (groupIndex === -1) {
        throw new TypeError('The group could not be found in the local storage');
      }
      groups[groupIndex] = Object.assign(groups[groupIndex], groupEntity.toDto(GroupLocalStorage.DEFAULT_CONTAIN));
      await this._setBrowserStorage({[this.storageKey]: groups});
      GroupLocalStorage._runtimeCachedData[this.account.id] = groups;
    });
  }

  /**
   * Delete groups in the local storage by groups ids.
   * @param {string} groupId group uuid
   */
  async delete(groupId) {
    await navigator.locks.request(this.storageKey, async() => {
      const groups = await this.get();
      if (groups) {
        const groupIndex = groups.findIndex(item => item.id === groupId);
        if (groupIndex !== -1) {
          groups.splice(groupIndex, 1);
        }
        await this._setBrowserStorage({[this.storageKey]: groups});
        GroupLocalStorage._runtimeCachedData[this.account.id] = groups;
      }
    });
  }

  /**
   * Make sure the entity meet some minimal requirements before being stored
   *
   * @param {GroupEntity} groupEntity
   * @throw {TypeError} if requirements are not met
   * @private
   */
  static assertEntityBeforeSave(groupEntity) {
    if (!groupEntity) {
      throw new TypeError('GroupLocalStorage expects a GroupEntity to be set');
    }
    if (!(groupEntity instanceof GroupEntity)) {
      throw new TypeError('GroupLocalStorage expects an object of type GroupEntity');
    }
    if (!groupEntity.id) {
      throw new TypeError('GroupLocalStorage expects GroupEntity id to be set');
    }
  }

  /**
   * Set the browser storage.
   * @todo Tool to test the semaphore. A dedicated local storage service could be implemented later on top
   * of the browser provided one to ease the testing.
   * @param {object} data The data to store in the local storage.
   * @returns {Promise<void>}
   * @private
   */
  async _setBrowserStorage(data) {
    await browser.storage.local.set(data);
  }

  /**
   * GroupLocalStorage.DEFAULT_CONTAIN
   * Warning: To be used for entity serialization not service API contain!
   *
   * @returns {{my_group_user: boolean, groups_users: boolean}}
   * @private
   */
  static get DEFAULT_CONTAIN() {
    return {my_group_user: true, groups_users: true};
  }
}

export default GroupLocalStorage;
