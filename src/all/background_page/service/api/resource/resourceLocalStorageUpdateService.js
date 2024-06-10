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
 * @since         4.6.0
 */
import ResourceLocalStorage from "../../local_storage/resourceLocalStorage";
import ResourcesCollection from "../../../model/entity/resource/resourcesCollection";
import ResourceService from "./resourceService";

const TIMER = 5000;
const lastTimeCalledPerAccount = {};
const RESOURCE_UPDATE_LOCK = 'resourceUpdateLock';
/**
 * The ResourceLocalStorageUpdateService perform a get or update the resources local storage
 */
class ResourceLocalStorageUpdateService {
  /**
   * The resources collection dto cached.
   * @type {Object}
   * @private
   */
  static _cachedResources = null;

  /**
   *
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.storageKey = this.getStorageKey(account);
    this.resourceService = new ResourceService(apiClientOptions);
  }

  /**
   * Get or find the password expiry settings in local storage.
   * @param {boolean} forceUpdate
   * @return {Promise<ResourcesCollection>}
   */
  async exec(forceUpdate = false) {
    return await navigator.locks.request(this.storageKey, () => this.getOrUpdateLocalStorage(forceUpdate));
  }

  /**
   * Get or update the resources in local storage.
   * @private
   * @param {boolean} forceUpdate
   * @return {Promise<ResourcesCollection>}
   */
  async getOrUpdateLocalStorage(forceUpdate = false) {
    if (forceUpdate && this.isTimeOverdue) {
      return this.updateLocalStorage();
    }

    if (ResourceLocalStorageUpdateService._cachedResources && ResourceLocalStorageUpdateService._cachedResources.length > 0) {
      return new ResourcesCollection(ResourceLocalStorageUpdateService._cachedResources, {clone: false, validate: false});
    }

    const resources = await ResourceLocalStorage.get();
    if (resources) {
      return new ResourcesCollection(resources, {clone: false});
    }
    return this.updateLocalStorage();
  }

  /**
   * Is time overdue
   * @private
   * @returns {boolean}
   */
  get isTimeOverdue() {
    const lastTimeCalled = lastTimeCalledPerAccount[this.account.id] || 0;
    return Date.now() - lastTimeCalled > TIMER;
  }


  /**
   * Update the resources in local storage
   * @private
   * @returns {Promise<ResourcesCollection>}
   */
  async updateLocalStorage() {
    let resourcesDto = await this.resourceService.findAll(ResourceLocalStorageUpdateService.DEFAULT_CONTAIN);
    resourcesDto = ResourcesCollection.sanitizeDto(resourcesDto);

    const resourcesCollection = new ResourcesCollection(resourcesDto, {clone: false});
    await ResourceLocalStorage.set(resourcesCollection);
    lastTimeCalledPerAccount[this.account.id] = Date.now();

    ResourceLocalStorageUpdateService._cachedResources = resourcesDto;

    return resourcesCollection;
  }

  /**
   * ResourceLocalStorageUpdateService.DEFAULT_CONTAIN
   * @private
   * @returns {Object}
   */
  static get DEFAULT_CONTAIN() {
    return {permission: true, favorite: true, tag: true};
  }

  /**
   * Get the storage key.
   * @param {AbstractAccountEntity} account The account to get the key for.
   * @returns {string}
   * @throws {Error} If it cannot retrieve account id.
   */
  getStorageKey(account) {
    if (!account.id) {
      throw new Error('Cannot retrieve account id, necessary to lock the password expiry settings get or find service.');
    }
    return `${RESOURCE_UPDATE_LOCK}-${account.id}`;
  }
}

export default ResourceLocalStorageUpdateService;
