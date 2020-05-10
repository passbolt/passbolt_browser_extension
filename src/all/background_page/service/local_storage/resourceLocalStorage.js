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
const Lock = require('../../utils/lock').Lock;
const lock = new Lock();

const {ResourceEntity} = require('../../model/entity/resource/resourceEntity');
const {ResourcesCollection} = require("../../model/entity/resource/resourcesCollection");

const RESOURCES_LOCAL_STORAGE_KEY = 'resources';

class ResourceLocalStorage {
  /**
   * Flush the resources local storage
   *
   * @throws {Error} if operation failed
   * @return {Promise<void>}
   */
  static async flush() {
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
  };

  /**
   * Set the resources in local storage.
   * @param {ResourcesCollection} resourcesCollection The folders to insert in the local storage.
   */
  static async set(resourcesCollection) {
    await lock.acquire();
    const resources = [];
    if (resourcesCollection) {
      if (!(resourcesCollection instanceof ResourcesCollection)) {
        throw new TypeError('ResourceLocalStorage::set expects a ResourcesCollection');
      }
      for (let resourceEntity of resourcesCollection) {
        ResourceLocalStorage.assertEntityBeforeSave(resourceEntity);
        resources.push(resourceEntity.toDto(ResourceLocalStorage.DEFAULT_CONTAIN));
      }
    }
    const result = await browser.storage.local.set({resources});
    lock.release();
    return result;
  };

  /**
   * Get a resource from the local storage by id
   *
   * @param {string} id The resource id
   * @return {object} resource object
   */
  static async getResourceById(id) {
    const resources = await ResourceLocalStorage.get();
    return resources.find(item => item.id === id);
  };

  /**
   * Add a resource in the local storage
   * @param {ResourceEntity} resourceEntity
   */
  static async addResource(resourceEntity) {
    await lock.acquire();
    try {
      ResourceLocalStorage.assertEntityBeforeSave(resourceEntity);
      const resources = await ResourceLocalStorage.get();
      resources.push(resourceEntity);
      await browser.storage.local.set({ resources });
      lock.release();
    } catch (error) {
      lock.release();
      throw error;
    }
  };

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
        throw new Error('The folder could not be found in the local storage');
      }
      resources[resourceIndex] = resourceEntity;
      await browser.storage.local.set({ resources });
      lock.release();
    } catch(error) {
      lock.release();
      throw error;
    }
  };

  /**
   * Delete resources in the local storage by resources ids.
   * @param {array} resourcesIds The list of resource ids
   */
  static async deleteResourcesById(resourcesIds) {
    await lock.acquire();
    try {
      const resources = await ResourceLocalStorage.get();
      if (resources) {
        resourcesIds.forEach(resourceId => {
          const resourceIndex = resources.findIndex(item => item.id === resourceId);
          if (resourceIndex !== -1) {
            resources.splice(resourceIndex, 1);
          }
        });
        await browser.storage.local.set({ resources });
        lock.release();
      }
    } catch(error) {
      lock.release();
      throw error;
    }
  };

  // =================================================
  // Static methods
  // =================================================
  /**
   * ResourceLocalStorage.DEFAULT_CONTAIN
   * @returns {{permission: boolean, favorite: boolean, tags: boolean}}
   */
  static get DEFAULT_CONTAIN() {
    return {permission: true, favorite: true, tags: true};
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

  // =================================================
  // Deprecated methods
  // Using DTOs instead of entities
  // =================================================
  /**
   * Set the resources local storage.
   * @param {array} resources The resources to insert in the local storage.
   * @deprecated
   */
  static async setLegacy(resources) {
    await lock.acquire();
    const result = await browser.storage.local.set({ resources });
    lock.release();
    return result;
  };

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
      await browser.storage.local.set({ resources });
      lock.release();
    } catch(error) {
      lock.release();
      throw error;
    }
  };
}

// Flush the local storage when this library is loaded
ResourceLocalStorage.flush();

// Flush the local storage when the passbolt user session is terminated
window.addEventListener("passbolt.global.auth.logged-out", () => {
  ResourceLocalStorage.flush();
});

// Flush the local storage when a window is closed.
// Strategy to catch the browser close event.
browser.tabs.onRemoved.addListener((tabId, evInfo) => {
  if (evInfo.isWindowClosing) {
    ResourceLocalStorage.flush();
  }
});

exports.ResourceLocalStorage = ResourceLocalStorage;
