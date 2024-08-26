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
const RESOURCE_TYPES_KEY = "resource-types";

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
   * @return {Promise<void>}
   */
  static async set(resourceTypesCollection) {
    assertType(resourceTypesCollection, ResourceTypesCollection, 'ResourceTypeLocalStorage::set expects a ResourceTypesCollection');
    await navigator.locks.request(RESOURCE_TYPES_KEY, async() => {
      await browser.storage.local.set({resourceTypes: resourceTypesCollection.toDto()});
    });
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
}

export default ResourceTypeLocalStorage;
