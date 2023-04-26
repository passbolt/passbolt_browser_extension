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
import ResourceTypeEntity from "../../model/entity/resourceType/resourceTypeEntity";
import ResourceTypesCollection from "../../model/entity/resourceType/resourceTypesCollection";
import Lock from "../../utils/lock";
const lock = new Lock();

const RESOURCE_TYPES_LOCAL_STORAGE_KEY = 'resourceTypes';

class ResourceTypeLocalStorage {
  /**
   * Flush the resourceTypes local storage
   *
   * @throws {Error} if operation failed
   * @return {Promise<void>}
   */
  static async flush() {
    Log.write({level: 'debug', message: 'ResourceTypeLocalStorage flushed'});
    return await browser.storage.local.remove(RESOURCE_TYPES_LOCAL_STORAGE_KEY);
  }

  /**
   * Set the resourceTypes local storage.
   *
   * @throws {Error} if operation failed
   * @return {Promise} results object, containing every object in keys that was found in the storage area.
   * If storage is not set, undefined will be returned.
   */
  static async get() {
    const {resourceTypes} = await browser.storage.local.get([RESOURCE_TYPES_LOCAL_STORAGE_KEY]);
    return resourceTypes;
  }

  /**
   * Set the resourceTypes in local storage.
   * @param {ResourceTypesCollection} resourceTypesCollection The folders to insert in the local storage.
   * @return {void}
   */
  static async set(resourceTypesCollection) {
    await lock.acquire();
    const resourceTypes = [];
    if (resourceTypesCollection) {
      if (!(resourceTypesCollection instanceof ResourceTypesCollection)) {
        throw new TypeError('ResourceTypeLocalStorage::set expects a ResourceTypesCollection');
      }
      for (const resourceTypeEntity of resourceTypesCollection) {
        ResourceTypeLocalStorage.assertEntityBeforeSave(resourceTypeEntity);
        resourceTypes.push(resourceTypeEntity.toDto());
      }
    }
    await browser.storage.local.set({resourceTypes: resourceTypes});
    lock.release();
  }

  /**
   * Get a resource from the local storage by id
   *
   * @param {string} id The resource id
   * @return {object} resource object
   */
  static async getResourceById(id) {
    const resourceTypes = await ResourceTypeLocalStorage.get();
    return resourceTypes.find(item => item.id === id);
  }

  /**
   * Add a resourceType in the local storage
   * @param {ResourceTypeEntity} resourceTypeEntity
   */
  static async addResourceType(resourceTypeEntity) {
    await lock.acquire();
    try {
      ResourceTypeLocalStorage.assertEntityBeforeSave(resourceTypeEntity);
      const resourceTypes = await ResourceTypeLocalStorage.get();
      resourceTypes.push(resourceTypeEntity.toDto());
      await browser.storage.local.set({resourceTypes: resourceTypes});
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
   * @param {ResourceTypeEntity} resourceTypeEntity
   * @throw {TypeError} if requirements are not met
   * @private
   */
  static assertEntityBeforeSave(resourceTypeEntity) {
    if (!resourceTypeEntity) {
      throw new TypeError('ResourceTypeLocalStorage expects a ResourceTypeEntity to be set');
    }
    if (!(resourceTypeEntity instanceof ResourceTypeEntity)) {
      throw new TypeError('ResourceTypeLocalStorage expects an object of type ResourceTypeEntity');
    }
    if (!resourceTypeEntity.id) {
      throw new TypeError('ResourceTypeLocalStorage expects ResourceTypeEntity id to be set');
    }
  }
}

export default ResourceTypeLocalStorage;
