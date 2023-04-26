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
import browser from "../../sdk/polyfill/browserPolyfill";
import Log from "../../model/log";
import GroupsCollection from "../../model/entity/group/groupsCollection";
import GroupEntity from "../../model/entity/group/groupEntity";
import Lock from "../../utils/lock";
const lock = new Lock();

const GROUP_LOCAL_STORAGE_KEY = 'groups';

class GroupLocalStorage {
  /**
   * Flush the groups local storage
   *
   * @throws {Error} if operation failed
   * @return {Promise<void>}
   */
  static async flush() {
    Log.write({level: 'debug', message: 'GroupLocalStorage flushed'});
    return await browser.storage.local.remove(GroupLocalStorage.GROUP_LOCAL_STORAGE_KEY);
  }

  /**
   * Set the groups local storage.
   *
   * @throws {Error} if operation failed
   * @return {Promise} results object, containing every object in keys that was found in the storage area.
   * If storage is not set, undefined will be returned.
   */
  static async get() {
    const {groups} = await browser.storage.local.get([GroupLocalStorage.GROUP_LOCAL_STORAGE_KEY]);
    return groups;
  }

  /**
   * Set the groups local storage.
   *
   * @param {GroupsCollection} groupsCollection The groups to insert in the local storage.
   * @return {void}
   */
  static async set(groupsCollection) {
    await lock.acquire();
    const groups = [];
    if (!(groupsCollection instanceof GroupsCollection)) {
      throw new TypeError('GroupLocalStorage::set expects a GroupsCollection');
    }
    for (const groupEntity of groupsCollection) {
      GroupLocalStorage.assertEntityBeforeSave(groupEntity);
      groups.push(groupEntity.toDto(GroupLocalStorage.DEFAULT_CONTAIN));
    }
    await browser.storage.local.set({groups: groups});
    lock.release();
  }

  /**
   * Get a group from the local storage by id
   *
   * @param {string} id The group id
   * @return {object} a group dto
   */
  static async getGroupById(id) {
    const groups = await GroupLocalStorage.get();
    return groups.find(item => item.id === id);
  }

  /**
   * Add a group in the local storage
   * @param {GroupEntity} groupEntity
   */
  static async addGroup(groupEntity) {
    await lock.acquire();
    try {
      GroupLocalStorage.assertEntityBeforeSave(groupEntity);
      const groups = await GroupLocalStorage.get();
      groups.push(groupEntity.toDto(GroupLocalStorage.DEFAULT_CONTAIN));
      await browser.storage.local.set({groups: groups});
      lock.release();
    } catch (error) {
      lock.release();
      throw error;
    }
  }

  /**
   * Update a group in the local storage.
   *
   * @param {GroupEntity} groupEntity The group to update
   * @throws {Error} if the group does not exist in the local storage
   */
  static async updateGroup(groupEntity) {
    await lock.acquire();
    try {
      GroupLocalStorage.assertEntityBeforeSave(groupEntity);
      const groups = await GroupLocalStorage.get();
      const groupIndex = groups.findIndex(item => item.id === groupEntity.id);
      if (groupIndex === -1) {
        throw new Error('The group could not be found in the local storage');
      }
      groups[groupIndex] = Object.assign(groups[groupIndex], groupEntity.toDto(GroupLocalStorage.DEFAULT_CONTAIN));
      await browser.storage.local.set({groups: groups});
      lock.release();
    } catch (error) {
      lock.release();
      throw error;
    }
  }

  /**
   * Delete groups in the local storage by groups ids.
   * @param {string} groupId group uuid
   */
  static async delete(groupId) {
    await lock.acquire();
    try {
      const groups = await GroupLocalStorage.get();
      if (groups) {
        const groupIndex = groups.findIndex(item => item.id === groupId);
        if (groupIndex !== -1) {
          groups.splice(groupIndex, 1);
        }
        await browser.storage.local.set({groups: groups});
        lock.release();
      }
    } catch (error) {
      lock.release();
      throw error;
    }
  }

  /**
   * GroupLocalStorage.DEFAULT_CONTAIN
   * Warning: To be used for entity serialization not service API contain!
   *
   * @returns {{permission: boolean}}
   * @private
   */
  static get DEFAULT_CONTAIN() {
    return {my_group_user: true, groups_users: true};
  }

  /**
   * GroupLocalStorage.GROUP_LOCAL_STORAGE_KEY
   * @returns {string}
   * @constructor
   */
  static get GROUP_LOCAL_STORAGE_KEY() {
    return GROUP_LOCAL_STORAGE_KEY;
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
}

export default GroupLocalStorage;
