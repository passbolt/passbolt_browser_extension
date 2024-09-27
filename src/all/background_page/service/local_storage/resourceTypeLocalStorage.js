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
import Log from "../../model/log";
import ResourceTypesCollection from "../../model/entity/resourceType/resourceTypesCollection";
import {assertType} from "../../utils/assertions";

const RESOURCE_TYPES_LOCAL_STORAGE_KEY = 'resourceTypes';

class ResourceTypeLocalStorage {
  /**
   * Get the storage key.
   * @private
   */
  static get storageKey() {
    return RESOURCE_TYPES_LOCAL_STORAGE_KEY;
  }

  /**
   * Flush the resourceTypes local storage
   *
   * @throws {Error} if operation failed
   * @return {Promise<void>}
   */
  static async flush() {
    Log.write({level: 'debug', message: 'ResourceTypeLocalStorage flushed'});
    return await browser.storage.local.remove(this.storageKey);
  }

  /**
   * Set the resourceTypes local storage.
   *
   * @throws {Error} if operation failed
   * @return {Promise<ResourceTypesCollectionDto>} results object, containing every object in keys that was found in the storage area.
   * If storage is not set, undefined will be returned.
   */
  static async get() {
    const {resourceTypes} = await browser.storage.local.get([this.storageKey]);
    return resourceTypes;
  }

  /**
   * Set the resourceTypes in local storage.
   * @param {ResourceTypesCollection} resourceTypesCollection The folders to insert in the local storage.
   * @return {Promise<void>}
   * @throws {TypeError} if the given argument is not a ResourceTypesCollection
   */
  static async set(resourceTypesCollection) {
    assertType(resourceTypesCollection, ResourceTypesCollection, 'ResourceTypeLocalStorage::set expects a ResourceTypesCollection');
    await navigator.locks.request(this.storageKey, async() => {
      await browser.storage.local.set({[this.storageKey]: resourceTypesCollection.toDto()});
    });
  }
}

export default ResourceTypeLocalStorage;
