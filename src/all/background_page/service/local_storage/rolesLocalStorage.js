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
 * @since         3.0.0
 */
import browser from "../../sdk/polyfill/browserPolyfill";
import Log from "../../model/log";
import RoleEntity from "passbolt-styleguide/src/shared/models/entity/role/roleEntity";
import RolesCollection from "passbolt-styleguide/src/shared/models/entity/role/rolesCollection";
import Lock from "../../utils/lock";
const lock = new Lock();

const ROLES_LOCAL_STORAGE_KEY = 'roles';

class RolesLocalStorage {
  /**
   * Flush the roles local storage
   *
   * @throws {Error} if operation failed
   * @return {Promise<void>}
   */
  static async flush() {
    Log.write({level: 'debug', message: 'RolesLocalStorage flushed'});
    return await browser.storage.local.remove(ROLES_LOCAL_STORAGE_KEY);
  }

  /**
   * Set the roles local storage.
   *
   * @throws {Error} if operation failed
   * @return {Promise} results object, containing every object in keys that was found in the storage area.
   * If storage is not set, undefined will be returned.
   */
  static async get() {
    const {roles} = await browser.storage.local.get([ROLES_LOCAL_STORAGE_KEY]);
    return roles;
  }

  /**
   * Set the roles in local storage.
   * @param {RolesCollection} rolesCollection The folders to insert in the local storage.
   * @return {void}
   */
  static async set(rolesCollection) {
    await lock.acquire();
    const roles = [];
    if (rolesCollection) {
      if (!(rolesCollection instanceof RolesCollection)) {
        throw new TypeError('RolesLocalStorage::set expects a RolesCollection');
      }
      for (const roleEntity of rolesCollection) {
        RolesLocalStorage.assertEntityBeforeSave(roleEntity);
        roles.push(roleEntity.toDto());
      }
    }
    await browser.storage.local.set({roles: roles});
    lock.release();
  }

  /**
   * Get a resource from the local storage by id
   *
   * @param {string} id The resource id
   * @return {object} resource object
   */
  static async getResourceById(id) {
    const roles = await RolesLocalStorage.get();
    return roles.find(item => item.id === id);
  }

  /**
   * Add a role in the local storage
   * @param {RoleEntity} roleEntity
   */
  static async addResourceType(roleEntity) {
    await lock.acquire();
    try {
      RolesLocalStorage.assertEntityBeforeSave(roleEntity);
      const roles = await RolesLocalStorage.get();
      roles.push(roleEntity.toDto());
      await browser.storage.local.set({roles: roles});
      lock.release();
    } catch (error) {
      lock.release();
      throw error;
    }
  }

  /*
   * =================================================
   * Static methods
   * =================================================
   */
  /**
   * Make sure the entity meet some minimal requirements before being stored
   *
   * @param {RoleEntity} roleEntity
   * @throw {TypeError} if requirements are not met
   * @private
   */
  static assertEntityBeforeSave(roleEntity) {
    if (!roleEntity) {
      throw new TypeError('RolesLocalStorage expects a RoleEntity to be set');
    }
    if (!(roleEntity instanceof RoleEntity)) {
      throw new TypeError('RolesLocalStorage expects an object of type RoleEntity');
    }
    if (!roleEntity.id) {
      throw new TypeError('RolesLocalStorage expects RoleEntity id to be set');
    }
  }
}

export default RolesLocalStorage;
