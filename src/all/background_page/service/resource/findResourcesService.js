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
 * @since         4.9.4
 */
import ResourceService from "../api/resource/resourceService";
import ResourceLocalStorage from "../local_storage/resourceLocalStorage";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import ResourceTypeModel from "../../model/resourceType/resourceTypeModel";
import {assertArrayUUID, assertUuid} from "../../utils/assertions";
import ExecuteConcurrentlyService from "../execute/executeConcurrentlyService";
import splitBySize from "../../utils/array/splitBySize";
import ResourceEntity from "../../model/entity/resource/resourceEntity";
import DecryptMetadataService from "../metadata/decryptMetadataService";

/**
 * The service aims to find resources from the API.
 */
export default class FindResourcesService {
  /**
   *
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.resourceService = new ResourceService(apiClientOptions);
    this.resourceTypeModel = new ResourceTypeModel(apiClientOptions);
    this.executeConcurrentlyService = new ExecuteConcurrentlyService();
    this.decryptMetadataService = new DecryptMetadataService(apiClientOptions, account);
  }

  /**
   * Find all
   *
   * @param {Object} [contains] optional example: {permissions: true}
   * @param {Object} [filters] optional
   * @param {boolean?} [ignoreInvalidEntity] Should invalid entities be ignored.
   * @returns {Promise<ResourcesCollection>}
   */
  async findAll(contains, filters, ignoreInvalidEntity) {
    //Assert contains
    const supportedOptions = ResourceService.getSupportedContainOptions();
    const supportedFilter = ResourceService.getSupportedFiltersOptions();

    if (contains && !Object.keys(contains).every(option => supportedOptions.includes(option))) {
      throw new Error("Unsupported contains parameter used, please check supported contains");
    }

    if (filters && !Object.keys(filters).every(filter => supportedFilter.includes(filter))) {
      throw new Error("Unsupported filter parameter used, please check supported filters");
    }

    const resourcesDto = await this.resourceService.findAll(contains, filters);
    return new ResourcesCollection(resourcesDto, {clone: false, ignoreInvalidEntity: ignoreInvalidEntity});
  }

  /**
   * Find all by ids
   * @param {Object} contains
   * @param {Array<string>} resourcesIds
   * @returns {Promise<ResourcesCollection>}
   */
  async findAllByIds(resourcesIds, contains = {}) {
    assertArrayUUID(resourcesIds);

    // We split the requests in chunks in order to avoid any too long url error.
    const resourcesIdsChunks = splitBySize(resourcesIds, 80);
    const callbacks = resourcesIdsChunks.map(resourceIds => {
      const filter = {
        "has-id": resourceIds
      };
      return async() => await this.findAll(contains, filter);
    });

    // @todo Later (tm). The Collection should provide this capability, ensuring that validation build rules are executed and performance is guaranteed.
    const arrayOfCollection = await this.executeConcurrentlyService.execute(callbacks, 5);
    const resourcesCollection = new ResourcesCollection();

    arrayOfCollection.forEach(collection => {
      resourcesCollection._items = resourcesCollection._items.concat(collection._items);
    });
    return resourcesCollection;
  }

  /**
   * Retrieve all resources for the local storage.
   * @returns {Promise<ResourcesCollection>}
   */
  async findAllForLocalStorage() {
    const resources = await this.findAll(ResourceLocalStorage.DEFAULT_CONTAIN, null, true);
    const resourceTypes = await this.resourceTypeModel.getOrFindAll();
    resources.filterByResourceTypes(resourceTypes);

    await this.decryptMetadataService.decryptAllFromForeignModels(resources, undefined, {ignoreDecryptionError: true});
    resources.filterOutMetadataEncrypted();

    return resources;
  }

  /**
   * Retrieve all resources shared with group for the local storage.
   * @param {uuid} groupId
   * @returns {Promise<ResourcesCollection>}
   */
  async findAllByIsSharedWithGroupForLocalStorage(groupId) {
    const resources = await this.findAll(ResourceLocalStorage.DEFAULT_CONTAIN, {"is-shared-with-group": groupId}, true);
    const resourceTypes = await this.resourceTypeModel.getOrFindAll();
    resources.filterByResourceTypes(resourceTypes);
    return resources;
  }

  /**
   * Retrieve all resources by ids for sharing.
   * @param {Array<string>} resourcesIds The resource ids to retrieve.
   * @returns {Promise<ResourcesCollection>}
   */
  async findAllByIdsForShare(resourcesIds) {
    assertArrayUUID(resourcesIds);

    const contains = {
      "secret": true
    };
    const resources =  await this.findAllByIds(resourcesIds, contains);
    await this.decryptMetadataService.decryptAllFromForeignModels(resources);

    return resources;
  }

  /**
   * Retrieve all resources by ids for display permissions.
   * @param {Array<uuid>} resourcesIds The resource ids to retrieve.
   * @returns {Promise<ResourcesCollection>}
   */
  async findAllByIdsForDisplayPermissions(resourcesIds) {
    assertArrayUUID(resourcesIds);

    const contains = {
      "permission": true,
      "permissions.user.profile": true,
      "permissions.group": true,
    };
    const resources = await this.findAllByIds(resourcesIds, contains);
    await this.decryptMetadataService.decryptAllFromForeignModels(resources);

    return resources;
  }

  /**
   * Find all resources for decrypt
   *
   * @param {array} resourcesIds resources uuids
   * @returns {Promise<ResourcesCollection>}
   */
  async findAllForDecrypt(resourcesIds) {
    assertArrayUUID(resourcesIds);

    const contains = {'secret': true};
    const resourceCollection =  await this.findAllByIds(resourcesIds, contains);

    return resourceCollection;
  }

  /**
   * Find a resource given an id
   *
   * @param {array} resourceId resource id
   * @param {Object} [contains] optional example: {permissions: true}
   * @returns {Promise<ResourceEntity>}
   */
  async findOneById(resourceId, contains = {}) {
    assertUuid(resourceId);
    //Assert contains
    const supportedOptions = ResourceService.getSupportedContainOptions();

    if (contains && !Object.keys(contains).every(option => supportedOptions.includes(option))) {
      throw new Error("Unsupported contains parameter used, please check supported contains");
    }
    const resourcesDto  = await this.resourceService.get(resourceId, contains);

    return new ResourceEntity(resourcesDto);
  }

  /**
   * Find the resource detail given an id
   *
   * @param {array} resourceId resource id
   * @returns {Promise<ResourceEntity>}
   */
  async findOneByIdForDetails(resourceId) {
    assertUuid(resourceId);

    const contains = {
      creator: true,
      modifier: true,
    };

    const resource = this.findOneById(resourceId, contains);
    return resource;
  }
}
