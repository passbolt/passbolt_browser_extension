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
import ResourceLocalStorage from "../local_storage/resourceLocalStorage";
import {assertNumber, assertUuid} from "../../utils/assertions";
import FindResourcesService from "./findResourcesService";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import ResourceTypeModel from "../../model/resourceType/resourceTypeModel";
import DecryptMetadataService from "../metadata/decryptMetadataService";

const RESOURCES_UPDATE_ALL_LS_LOCK_PREFIX = 'RESOURCES_UPDATE_LS_LOCK_';

/**
 * The service aim to find and update the resources local storage service.
 */
class FindAndUpdateResourcesLocalStorage {
  /**
   * The last times the update all operation run, the object key represents the account id.
   * @type {object}
   * @private
   */
  static lastUpdateAllTimes = {};

  /**
   * @constructor
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.findResourcesServices = new FindResourcesService(account, apiClientOptions);
    this.resourceTypeModel = new ResourceTypeModel(apiClientOptions);
    this.decryptMetadataService = new DecryptMetadataService(apiClientOptions, account);
  }

  /**
   * Find and update the local storage with all the resources retrieved from the API.
   * @param {object} [options={}] Options.
   * @param {number} [options.updatePeriodThreshold] Do not update the local storage if the threshold is not overdue.
   * @param {string|null} [passphrase = null] The passphrase to use to decrypt the metadata. Marked as optional as it
   * might be available in the passphrase session storage.
   * @return {Promise<ResourcesCollection>}
   */
  async findAndUpdateAll({updatePeriodThreshold} = {}, passphrase = null) {
    assertNumber(updatePeriodThreshold, "Parameter updatePeriodThreshold should be a number.");

    const lockKey = `${RESOURCES_UPDATE_ALL_LS_LOCK_PREFIX}${this.account.id}`;
    const lastUpdateTime = FindAndUpdateResourcesLocalStorage.lastUpdateAllTimes[this.account.id] ?? null;

    const isRuntimeCacheInitialized = ResourceLocalStorage.hasCachedData();
    const localStorageResourceCollection = await ResourceLocalStorage.get();

    // Do not update the storage if the defined period, during which the local storage doesn't need to be refreshed, has not yet passed.
    if (updatePeriodThreshold && lastUpdateTime && Boolean(localStorageResourceCollection)) {
      if (Date.now() - lastUpdateTime < updatePeriodThreshold) {
        return new ResourcesCollection(localStorageResourceCollection, {validate: !isRuntimeCacheInitialized});
      }
    }

    // If no update is in progress, refresh the local storage.
    return await navigator.locks.request(lockKey, {ifAvailable: true}, async lock => {
      // Lock not granted, an update is already in progress. Wait for its completion to notify the function consumer.
      if (!lock) {
        return await navigator.locks.request(lockKey, {mode: "shared"}, async() =>
          /*
           * Return the data from local storage while waiting for the update in progress.
           * @todo it does not return the latest information but the previous one.
           */
          new ResourcesCollection(localStorageResourceCollection, {validate: !isRuntimeCacheInitialized})
        );
      }

      // Lock is granted, retrieve all resources and update the local storage.
      const localResourcesCollection = new ResourcesCollection(localStorageResourceCollection || [], {validate: isRuntimeCacheInitialized});

      const updatedResourcesCollection = await this.findResourcesServices.findAllForLocalStorage();
      const resourceTypes = await this.resourceTypeModel.getOrFindAll();
      updatedResourcesCollection.filterByResourceTypes(resourceTypes);
      updatedResourcesCollection.setDecryptedMetadataFromCollection(localResourcesCollection);

      await this.decryptMetadataService.decryptAllFromForeignModels(updatedResourcesCollection, passphrase, {ignoreDecryptionError: true, updateSessionKeys: true});
      updatedResourcesCollection.filterOutMetadataEncrypted();

      await ResourceLocalStorage.set(updatedResourcesCollection);

      FindAndUpdateResourcesLocalStorage.lastUpdateAllTimes[this.account.id] = Date.now();

      // Return the updated resources collection from the API
      return updatedResourcesCollection;
    });
  }

  /**
   * Find and update the local storage with the resources filtered by group id retrieved from the API.
   * @param {string} groupId The group id to filter the resources with.
   * @param {string|null} [passphrase = null] The passphrase to use to decrypt the metadata. Marked as optional as it
   * might be available in the passphrase session storage.
   * @return {Promise<ResourcesCollection>} The resource shared with the group
   * @throw {TypeError} If the groupId is not valid UUID
   */
  async findAndUpdateByIsSharedWithGroup(groupId, passphrase = null) {
    const resourcesCollection = await this.findResourcesServices.findAllByIsSharedWithGroupForLocalStorage(groupId, passphrase);
    await ResourceLocalStorage.addOrReplaceResourcesCollection(resourcesCollection);
    return resourcesCollection;
  }

  /**
   * Find and update the local storage with the resources filtered by parent folder id retrieved from the API.
   * @param {string} parentFolderId The parent folder id to filter the resources with.
   * @return {Promise<ResourcesCollection>} The resource shared with the group
   * @throw {TypeError} If the parentFolderId is not valid UUID
   */
  async findAndUpdateByParentFolderId(parentFolderId) {
    assertUuid(parentFolderId);
    const resourcesCollection = await this.findResourcesServices.findByParentFolderIdForLocalStorage(parentFolderId);
    await ResourceLocalStorage.addOrReplaceResourcesCollection(resourcesCollection);
    return resourcesCollection;
  }
}

export default FindAndUpdateResourcesLocalStorage;
