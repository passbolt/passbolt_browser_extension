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
 * @since         2.11.0
 */
import browser from "../../sdk/polyfill/browserPolyfill";
import Log from "../../model/log";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import ResourceEntity from "../../model/entity/resource/resourceEntity";
import Lock from "../../utils/lock";
const lock = new Lock();

const RESOURCES_LOCAL_STORAGE_KEY = 'resources';

class ResourceLocalStorage {
  /**
   * Flush the resources local storage
   *
   * @throws {Error} if operation failed
   * @return {Promise<void>}
   */
  static async flush() {
    Log.write({level: 'debug', message: 'ResourceLocalStorage flushed'});
    return await browser.storage.local.remove(RESOURCES_LOCAL_STORAGE_KEY);
  }

  /**
   * Set the resources local storage.
   *
   * @throws {Error} if operation failed
   * @return {Promise} results object, containing every object in keys that was found in the storage area.
   * If storage is not set, undefined will be returned.
   */
  static async get() {
    const {resources} = await browser.storage.local.get([RESOURCES_LOCAL_STORAGE_KEY]);
    return resources;
  }

  /**
   * Set the resources in local storage.
   * @param {ResourcesCollection} resourcesCollection The resources to insert in the local storage.
   * @return {void}
   */
  static async set(resourcesCollection) {
    await lock.acquire();
    const resources = [];
    if (resourcesCollection) {
      if (!(resourcesCollection instanceof ResourcesCollection)) {
        throw new TypeError('ResourceLocalStorage::set expects a ResourcesCollection');
      }
      for (const resourceEntity of resourcesCollection) {
        ResourceLocalStorage.assertEntityBeforeSave(resourceEntity);
        resources.push(resourceEntity.toDto(ResourceLocalStorage.DEFAULT_CONTAIN));
      }
    }
    await browser.storage.local.set({resources: resources});
    lock.release();
  }

  /**
   * Get a resource from the local storage by id
   *
   * @param {string} id The resource id
   * @return {object} resource dto object
   */
  static async getResourceById(id) {
    const resources = await ResourceLocalStorage.get();
    return resources.find(item => item.id === id);
  }


  /**
   * Add a resource in the local storage
   * @param {ResourceEntity} resourceEntity
   */
  static async addResource(resourceEntity) {
    await lock.acquire();
    try {
      ResourceLocalStorage.assertEntityBeforeSave(resourceEntity);
      const resources = await ResourceLocalStorage.get();
      resources.push(resourceEntity.toDto(ResourceLocalStorage.DEFAULT_CONTAIN));
      await browser.storage.local.set({resources: resources});
      lock.release();
    } catch (error) {
      lock.release();
      throw error;
    }
  }

  /**
   * Add multiple resources to the local storage
   * @param {Array<ResourceEntity>} resourceEntities
   */
  static async addResources(resourceEntities) {
    await lock.acquire();
    try {
      const resources = await ResourceLocalStorage.get();
      resourceEntities.forEach(resourceEntity => {
        ResourceLocalStorage.assertEntityBeforeSave(resourceEntity);
        resources.push(resourceEntity.toDto(ResourceLocalStorage.DEFAULT_CONTAIN));
      });
      await browser.storage.local.set({resources: resources});
      lock.release();
    } catch (error) {
      lock.release();
      throw error;
    }
  }

  /**
   * Update a resource in the local storage.
   * @param {ResourceEntity} resourceEntity The resource to update
   * @throws {Error} if the resource does not exist in the local storage
   */
  static async updateResource(resourceEntity) {
    await lock.acquire();
    try {
      ResourceLocalStorage.assertEntityBeforeSave(resourceEntity);
      const resources = await ResourceLocalStorage.get();
      const resourceIndex = resources.findIndex(item => item.id === resourceEntity.id);
      if (resourceIndex === -1) {
        throw new Error('The resource could not be found in the local storage');
      }
      resources[resourceIndex] = resourceEntity.toDto(ResourceLocalStorage.DEFAULT_CONTAIN);
      await browser.storage.local.set({resources: resources});
      lock.release();
    } catch (error) {
      lock.release();
      throw error;
    }
  }

  /**
   * Update a resource collection in the local storage.
   * @param {ResourcesCollection} resourcesCollection The resources to update
   * @throws {Error} if the resource does not exist in the local storage
   */
  static async updateResourcesCollection(resourcesCollection) {
    await lock.acquire();
    try {
      const resources = await ResourceLocalStorage.get();
      for (const resourceEntity of resourcesCollection) {
        ResourceLocalStorage.assertEntityBeforeSave(resourceEntity);
        const resourceIndex = resources.findIndex(item => item.id === resourceEntity.id);
        if (resourceIndex === -1) {
          throw new Error('The resource could not be found in the local storage');
        }
        resources[resourceIndex] = resourceEntity.toDto(ResourceLocalStorage.DEFAULT_CONTAIN);
      }
      await browser.storage.local.set({resources: resources});
      lock.release();
    } catch (error) {
      lock.release();
      throw error;
    }
  }

  /**
   * Delete a resource in the local storage by id.
   * @param {string} resourceId The resource id
   */
  static async delete(resourceId) {
    await lock.acquire();
    try {
      const resources = await ResourceLocalStorage.get();
      if (resources) {
        const resourceIndex = resources.findIndex(item => item.id === resourceId);
        if (resourceIndex !== -1) {
          resources.splice(resourceIndex, 1);
        }
        await browser.storage.local.set({resources: resources});
        lock.release();
      }
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
   * ResourceLocalStorage.DEFAULT_CONTAIN
   * Warning: To be used for entity serialization not service API contain!
   *
   * @returns {Object}
   * @private
   */
  static get DEFAULT_CONTAIN() {
    return {permission: true, favorite: true, tag: true};
  }

  /**
   * Make sure the entity meet some minimal requirements before being stored
   *
   * @param {ResourceEntity} resourceEntity
   * @throw {TypeError} if requirements are not met
   * @private
   */
  static assertEntityBeforeSave(resourceEntity) {
    if (!resourceEntity) {
      throw new TypeError('ResourceLocalStorage expects a ResourceEntity to be set');
    }
    if (!(resourceEntity instanceof ResourceEntity)) {
      throw new TypeError('ResourceLocalStorage expects an object of type ResourceEntity');
    }
    if (!resourceEntity.id) {
      throw new TypeError('ResourceLocalStorage expects ResourceEntity id to be set');
    }
    if (!resourceEntity.permission) {
      throw new TypeError('ResourceLocalStorage::set expects ResourceEntity permission to be set');
    }
  }

  /*
   * =================================================
   * Deprecated methods
   * Stop using DTOs instead one should use entities
   * =================================================
   */
  /**
   * Update a resource in the local storage.
   * @param {object} resource The resource to update
   * @deprecated
   */
  static async updateResourceLegacy(resource) {
    await lock.acquire();
    try {
      const resources = await ResourceLocalStorage.get();
      const resourceIndex = resources.findIndex(item => item.id === resource.id);
      resources[resourceIndex] = resource;
      await browser.storage.local.set({resources: resources});
      lock.release();
    } catch (error) {
      lock.release();
      throw error;
    }
  }
}

export default ResourceLocalStorage;
