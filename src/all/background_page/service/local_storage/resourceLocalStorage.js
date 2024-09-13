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
import Log from "../../model/log";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import ResourceEntity from "../../model/entity/resource/resourceEntity";
import Lock from "../../utils/lock";
import {assertArray, assertType, assertUuid} from "../../utils/assertions";
import PasswordExpiryResourceEntity from "../../model/entity/passwordExpiry/passwordExpiryResourceEntity";
const lock = new Lock();

export const RESOURCES_LOCAL_STORAGE_KEY = 'resources';

class ResourceLocalStorage {
  /**
   * Cached data.
   * @type {Object}
   * @private
   */
  static _cachedData = null;

  /**
   * Check if there is cached data.
   * @returns {boolean}
   */
  static hasCachedData() {
    return ResourceLocalStorage._cachedData !== null;
  }

  /**
   * Flush the resources local storage
   *
   * @throws {Error} if operation failed
   * @return {Promise<void>}
   */
  static async flush() {
    Log.write({level: 'debug', message: 'ResourceLocalStorage flushed'});
    await browser.storage.local.remove(RESOURCES_LOCAL_STORAGE_KEY);
    ResourceLocalStorage._cachedData = null;
  }

  /**
   * Set the resources local storage.
   *
   * It's essential to understand that this function produces a duplicate of the local storage value, not a reference.
   * Therefore, any changes made to this duplicate will not affect the original data or a cache.
   *
   * @throws {Error} if operation failed
   * @return {Promise<array>} results object, containing every object in keys that was found in the storage area.
   * If storage is not set, undefined will be returned.
   */
  static async get() {
    if (!ResourceLocalStorage._cachedData) {
      const {resources} = await browser.storage.local.get([RESOURCES_LOCAL_STORAGE_KEY]);
      ResourceLocalStorage._cachedData = resources;
    }

    return ResourceLocalStorage._cachedData;
  }

  /**
   * Set the resources in local storage.
   * @param {ResourcesCollection} resourcesCollection The resources to insert in the local storage.
   * @return {Promise<void>}
   */
  static async set(resourcesCollection) {
    await lock.acquire();
    try {
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
      ResourceLocalStorage._cachedData = resources;
    } finally {
      lock.release();
    }
  }

  /**
   * Get a resource from the local storage by id
   *
   * @param {string} id The resource id
   * @return {object} resource dto object
   */
  static async getResourceById(id) {
    const resources = await ResourceLocalStorage.get();
    return resources?.find(item => item.id === id);
  }


  /**
   * Add a resource in the local storage
   * @param {ResourceEntity} resourceEntity
   */
  static async addResource(resourceEntity) {
    await lock.acquire();
    try {
      ResourceLocalStorage.assertEntityBeforeSave(resourceEntity);
      const resources = await ResourceLocalStorage.get() || [];
      resources.push(resourceEntity.toDto(ResourceLocalStorage.DEFAULT_CONTAIN));
      await browser.storage.local.set({resources: resources});
      ResourceLocalStorage._cachedData = resources;
    } finally {
      lock.release();
    }
  }

  /**
   * Add multiple resources to the local storage
   * @param {Array<ResourceEntity>} resourceEntities
   */
  static async addResources(resourceEntities) {
    assertArray(resourceEntities, "The parameter resourcesEntities should be an array");
    await lock.acquire();
    try {
      const resources = await ResourceLocalStorage.get() || [];
      resourceEntities.forEach(resourceEntity => {
        ResourceLocalStorage.assertEntityBeforeSave(resourceEntity);
        resources.push(resourceEntity.toDto(ResourceLocalStorage.DEFAULT_CONTAIN));
      });
      await browser.storage.local.set({resources: resources});
      ResourceLocalStorage._cachedData = resources;
    } finally {
      lock.release();
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
      const resources = await ResourceLocalStorage.get() || [];
      const resourceIndex = resources.findIndex(item => item.id === resourceEntity.id);
      if (resourceIndex === -1) {
        throw new Error('The resource could not be found in the local storage');
      }
      resources[resourceIndex] = resourceEntity.toDto(ResourceLocalStorage.DEFAULT_CONTAIN);
      await browser.storage.local.set({resources: resources});
      ResourceLocalStorage._cachedData = resources;
    } finally {
      lock.release();
    }
  }

  /**
   * Update a resource collection in the local storage.
   * @param {ResourcesCollection} resourcesCollection The resources to update
   * @throws {Error} if the resource does not exist in the local storage
   */
  static async updateResourcesCollection(resourcesCollection) {
    assertType(resourcesCollection, ResourcesCollection, 'The parameter resourcesEntities should be of ResourcesCollection type.');
    await lock.acquire();
    try {
      const resources = await ResourceLocalStorage.get() || [];
      for (const resourceEntity of resourcesCollection) {
        ResourceLocalStorage.assertEntityBeforeSave(resourceEntity);
        const resourceIndex = resources.findIndex(item => item.id === resourceEntity.id);
        if (resourceIndex === -1) {
          throw new Error('The resource could not be found in the local storage');
        }
        resources[resourceIndex] = resourceEntity.toDto(ResourceLocalStorage.DEFAULT_CONTAIN);
      }
      await browser.storage.local.set({resources: resources});
      ResourceLocalStorage._cachedData = resources;
    } finally {
      lock.release();
    }
  }

  /**
   * Update the expiry date of a resource collection in the local storage.
   * @param {array<PasswordExpiryResourceEntity>} passwordExpiryResourcesCollection The resources to update
   * @throws {Error} if the resource does not exist in the local storage
   */
  static async updateResourcesExpiryDate(passwordExpiryResourcesCollection) {
    await lock.acquire();
    try {
      const resources = await ResourceLocalStorage.get() || [];
      for (const passwordExpiryResourceEntity of passwordExpiryResourcesCollection) {
        assertType(passwordExpiryResourceEntity, PasswordExpiryResourceEntity, 'The given entity is not a PasswordExpiryResourceEntity');
        const resourceIndex = resources.findIndex(item => item.id === passwordExpiryResourceEntity.id);
        if (resourceIndex === -1) {
          throw new Error('The resource could not be found in the local storage');
        }
        resources[resourceIndex].expired = passwordExpiryResourceEntity.expired;
      }
      await browser.storage.local.set({resources: resources});
      ResourceLocalStorage._cachedData = resources;
    } finally {
      lock.release();
    }
  }

  /**
   * Delete a resource in the local storage by id.
   * @param {string} resourceId The resource id
   */
  static async delete(resourceId) {
    assertUuid(resourceId, "The parameter resourceId should be a UUID.");
    await lock.acquire();
    try {
      const resources = await ResourceLocalStorage.get() || [];
      if (resources.length > 0) {
        const resourceIndex = resources.findIndex(item => item.id === resourceId);
        if (resourceIndex !== -1) {
          resources.splice(resourceIndex, 1);
        }
        await browser.storage.local.set({resources: resources});
        ResourceLocalStorage._cachedData = resources;
      }
    } finally {
      lock.release();
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
}

export default ResourceLocalStorage;
