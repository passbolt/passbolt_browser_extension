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
 */
import ResourceLocalStorage from "../../service/local_storage/resourceLocalStorage";
import ResourceTypeModel from "../../model/resourceType/resourceTypeModel";
import ResourcesCollection from "../entity/resource/resourcesCollection";
import PermissionEntity from "../entity/permission/permissionEntity";
import PermissionsCollection from "../entity/permission/permissionsCollection";
import ResourceEntity from "../entity/resource/resourceEntity";
import PermissionChangesCollection from "../entity/permission/change/permissionChangesCollection";
import MoveService from "../../service/api/move/moveService";
import ResourceService from "../../service/api/resource/resourceService";
import PlaintextEntity from "../entity/plaintext/plaintextEntity";
import splitBySize from "../../utils/array/splitBySize";

const BULK_OPERATION_SIZE = 5;
const MAX_LENGTH_PLAINTEXT = 4096;

class ResourceModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.resourceService = new ResourceService(apiClientOptions);
    this.moveService = new MoveService(apiClientOptions);
    this.resourceTypeModel = new ResourceTypeModel(apiClientOptions);
  }

  /**
   * Update the resources local storage with the latest API resources the user has access.
   *
   * @return {ResourcesCollection}
   */
  async updateLocalStorage() {
    const contain = {permission: true, favorite: true, tag: true};
    const resourcesCollection = await this.findAll(contain, null, null, true);
    await ResourceLocalStorage.set(resourcesCollection);
    return resourcesCollection;
  }

  /*
   * ==============================================================
   *  Local storage getters
   * ==============================================================
   */
  /**
   * Get a collection of resources from the local storage by id
   *
   * @param {Array} folderIds The folder id
   * @return {ResourcesCollection}
   */
  async getAllByParentIds(folderIds) {
    const localResources = await ResourceLocalStorage.get();
    const resourcesCollection = new ResourcesCollection([]);
    for (const i in localResources) {
      const resourceDto = localResources[i];
      if (folderIds.includes(resourceDto.folder_parent_id)) {
        resourcesCollection.push(resourceDto);
      }
    }
    return resourcesCollection;
  }

  /**
   * Get a collection of resources from the local storage by id
   *
   * @param {Array} resourceIds The resource ids
   * @return {ResourcesCollection}
   */
  async getAllByIds(resourceIds) {
    const localResources = await ResourceLocalStorage.get();
    const filteredResources = localResources.filter(localResource => resourceIds.includes(localResource.id));
    return new ResourcesCollection(filteredResources);
  }

  /**
   * Return a resource for a given id from the local storage
   *
   * @param {string} resourceId uuid
   * @returns {Promise<ResourceEntity>}
   */
  async getById(resourceId) {
    const resourceDto = await ResourceLocalStorage.getResourceById(resourceId);
    return new ResourceEntity(resourceDto);
  }

  /**
   * Returns the cached collection of resoures or fetch them otherwise
   * @return {Promise<void>}
   */
  async getOrFindAll() {
    const localResources = await ResourceLocalStorage.get();
    return localResources ? new ResourcesCollection(localResources) : this.findAll();
  }

  /*
   * ==============================================================
   *  Permission changes
   * ==============================================================
   */
  /**
   * Calculate permission changes for a move
   * From current permissions, remove the parent folder permissions, add the destination permissions
   * From this new set of permission and the original permission calculate the needed changed
   *
   * NOTE: This function requires permissions to be set for all objects
   *
   * @param {ResourceEntity} resource
   * @param {(FolderEntity|null)} parentFolder
   * @param {(FolderEntity|null)} destFolder
   * @returns {PermissionChangesCollection}
   */
  calculatePermissionsChangesForMove(resource, parentFolder, destFolder) {
    let remainingPermissions = new PermissionsCollection([], false);

    // Remove permissions from parent if any
    if (parentFolder !== null) {
      if (!resource.permissions || !parentFolder.permissions) {
        throw new TypeError('Resource model calculatePermissionsChangesForMove requires permissions to be set.');
      }
      remainingPermissions = PermissionsCollection.diff(resource.permissions, parentFolder.permissions, false);
    }
    // Add parent permissions
    let permissionsFromParent = new PermissionsCollection([], false);
    if (destFolder) {
      if (!destFolder.permissions) {
        throw new TypeError('Resource model calculatePermissionsChangesForMove requires destination permissions to be set.');
      }
      permissionsFromParent = destFolder.permissions.cloneForAco(
        PermissionEntity.ACO_RESOURCE, resource.id, false
      );
    }

    const newPermissions = PermissionsCollection.sum(remainingPermissions, permissionsFromParent, false);
    if (!destFolder) {
      /*
       * If the move is toward the root
       * Reuse highest permission
       */
      newPermissions.addOrReplace(new PermissionEntity({
        aco: PermissionEntity.ACO_RESOURCE,
        aro: resource.permission.aro,
        aco_foreign_key: resource.id,
        aro_foreign_key: resource.permission.aroForeignKey,
        type: PermissionEntity.PERMISSION_OWNER,
      }));
    }
    newPermissions.assertAtLeastOneOwner();
    return PermissionChangesCollection.calculateChanges(resource.permissions, newPermissions);
  }

  /**
   * Calculate permission changes for a create
   * From current permissions add the destination permissions
   *
   * NOTE: This function requires destFolder permissions to be set
   *
   * @param {ResourceEntity} resource
   * @param {(FolderEntity|null)} destFolder destination
   * @returns {Promise<PermissionChangesCollection>}
   */
  async calculatePermissionsChangesForCreate(resource, destFolder) {
    let changes = null;
    if (destFolder) {
      if (!destFolder.permissions) {
        throw new TypeError('Resource model calculatePermissionsChangesForMove requires destination permissions to be set.');
      }
      const currentPermissions = new PermissionsCollection([resource.permission]);
      const permissionsFromDest = destFolder.permissions.cloneForAco(PermissionEntity.ACO_RESOURCE, resource.id);
      changes = PermissionChangesCollection.calculateChanges(currentPermissions, permissionsFromDest);
    }
    return changes;
  }

  /*
   * ==============================================================
   *  Finders / remote calls
   * ==============================================================
   */
  /**
   * Find all
   *
   * @param {Object} [contains] optional example: {permissions: true}
   * @param {Object} [filters] optional
   * @param {Object} [orders] optional
   * @param {boolean?} preSanitize (optional) should the service result be sanitized prior to the entity creation
   * @returns {Promise<ResourcesCollection>}
   */
  async findAll(contains, filters, orders, preSanitize) {
    let resourcesDto = await this.resourceService.findAll(contains, filters, orders);
    resourcesDto = await this.keepResourcesSupported(resourcesDto);
    if (preSanitize) {
      resourcesDto = ResourcesCollection.sanitizeDto(resourcesDto);
    }
    return new ResourcesCollection(resourcesDto);
  }

  /**
   * Find all for share
   *
   * @param {array} resourcesIds resource uuids
   * @returns {Promise<ResourcesCollection>}
   */
  async findAllForShare(resourcesIds) {
    const resourcesDto = await this.resourceService.findAllForShare(resourcesIds);
    return new ResourcesCollection(resourcesDto);
  }

  /**
   * Find all resources for decrypt
   *
   * @param {array} resourcesIds resources uuids
   * @returns {Promise<ResourcesCollection>}
   */
  async findAllForDecrypt(resourcesIds) {
    let resourcesDto = [];
    // We split the requests in chunks in order to avoid any too long url error.
    const resourcesIdsChunks = splitBySize(resourcesIds, 80);
    for (const resourcesIdsChunk of resourcesIdsChunks) {
      const partialResourcesDto = await this.resourceService.findAll({'secret': true, 'resource-type': true}, {'has-id': resourcesIdsChunk});
      resourcesDto = [...resourcesDto, ...partialResourcesDto];
    }
    return new ResourcesCollection(resourcesDto);
  }

  /**
   * Find a resource to share
   *
   * @param {string} resourcesId resource uuid
   * @returns {Promise<ResourceEntity>}
   */
  async findForDecrypt(resourcesId) {
    const resourcesDto = await this.resourceService.get(resourcesId, {'secret': true, 'resource-type': true});
    return new ResourceEntity(resourcesDto);
  }

  /**
   * Find permissions for a resource
   *
   * @param {string} resourcesId resource uuid
   * @returns {Promise<PermissionsCollection>}
   */
  async findResourcePermissions(resourcesId) {
    const contain = {'permissions.user.profile': true, 'permissions.group': true};

    /*
     *  TODO deprecate findAll with has-id filter and use what's in comment
     *  TODO not possible for backward compatibility issues, because permissions filter not present < v3
     * const resourcesDto = await this.resourceService.get(resourcesId, contain);
     * const resourceEntity = new ResourceEntity(resourcesDto);
     * return resourceEntity.permissions;
     */

    // @deprecated
    const filter = {'has-id': [resourcesId]};
    const resourceDtos = await this.resourceService.findAll(contain, filter);
    const resourceEntity = new ResourceEntity(resourceDtos[0]); // will fail if not found but not clean 404
    return resourceEntity.permissions;
  }

  /**
   * Returns the count of possible resources to suggest given an url
   * @param currentUrl An url
   * @return {*[]|number}
   */
  async countSuggestedResources(url) {
    if (!url) {
      return 0;
    }
    return (await this.getOrFindAll()).countSuggestedResources(url);
  }

  /**
   * Returns the possible resources to suggest given an url
   * @param currentUrl An url
   * @return {*[]|number}
   */
  async findSuggestedResources(url) {
    if (!url) {
      return 0;
    }
    const toDto = resourceEntity => resourceEntity.toDto();
    return (await this.getOrFindAll()).findSuggestedResources(url).map(toDto);
  }

  /*
   * ==============================================================
   *  CRUD
   * ==============================================================
   */
  /**
   * Create a resource using Passbolt API and add result to local storage
   *
   * @param {ResourceEntity} resourceEntity
   * @returns {Promise<ResourceEntity>}
   */
  async create(resourceEntity) {
    const data = resourceEntity.toDto({secrets: true});
    const contain = {permission: true, favorite: true, tags: true, folder: true};
    const resourceDto = await this.resourceService.create(data, contain);
    const newResourceEntity = new ResourceEntity(resourceDto);
    await ResourceLocalStorage.addResource(newResourceEntity);
    return newResourceEntity;
  }

  /**
   * Update a resource using Passbolt API and add result to local storage
   *
   * @param {ResourceEntity} resourceEntity
   * @returns {Promise<ResourceEntity>}
   */
  async update(resourceEntity) {
    const data = resourceEntity.toDto({secrets: true});
    const resourceDto = await this.resourceService.update(resourceEntity.id, data, ResourceLocalStorage.DEFAULT_CONTAIN);
    const updatedResourceEntity = new ResourceEntity(resourceDto);
    await ResourceLocalStorage.updateResource(updatedResourceEntity);
    return updatedResourceEntity;
  }

  /**
   * Update resources in the local storage
   *
   * @param {ResourcesCollection} resourcesCollection
   * @returns {Promise<void>}
   */
  async updateCollection(resourcesCollection) {
    await ResourceLocalStorage.updateResourcesCollection(resourcesCollection);
  }

  /**
   * Delete a resource using Passbolt API and remove the resource from the local storage
   *
   * @param {string} resourceId The resource id
   * @returns {Promise<void>}
   */
  async delete(resourceId) {
    await this.resourceService.delete(resourceId);
    await ResourceLocalStorage.delete(resourceId);
  }

  /**
   * Move resources using Passbolt API
   *
   * @param {ResourceEntity} resourceEntity the resource entity
   * @param {(string|null)} folderParentId the folder parent
   */
  async move(resourceEntity, folderParentId) {
    resourceEntity.folderParentId = folderParentId;
    await this.moveService.move(resourceEntity);
  }

  /*
   * ==============================================================
   *  Bulk operations
   * ==============================================================
   */
  /**
   * Create a bulk of resources
   * @param {ResourcesCollection} collection The collection of resources to import
   * @param {{successCallback: function, errorCallback: function}?} callbacks The intermediate operation callbacks
   * @returns {Promise<array<ResourceEntity|Error>>}
   */
  async bulkCreate(collection, callbacks) {
    let result = [];

    // Parallelize the operations by chunk of BULK_OPERATION_SIZE operations.
    const chunks = splitBySize(collection.resources, BULK_OPERATION_SIZE);
    for (const chunkIndex in chunks) {
      const chunk = chunks[chunkIndex];
      const promises = chunk.map(async(resourceId, mapIndex) => {
        const collectionIndex = (chunkIndex * BULK_OPERATION_SIZE) + mapIndex;
        return this._bulkCreate_createResource(resourceId, collectionIndex, callbacks);
      });

      const bulkPromises = await Promise.allSettled(promises);
      const intermediateResult = bulkPromises.map(promiseResult => promiseResult.value);
      result = [...result, ...intermediateResult];
    }

    // Insert the created resources in the local storage
    const createdResources = result.filter(row => row instanceof ResourceEntity);
    await ResourceLocalStorage.addResources(createdResources);

    return result;
  }

  /**
   * Create a resource for the bulkCreate function.
   * @param {ResourceEntity} resourceEntity The resource to create
   * @param {int} collectionIndex The index of the resource in the initial collection
   * @param {{successCallback: function, errorCallback: function}?} callbacks The intermediate operation callbacks
   * @returns {Promise<ResourceEntity>}
   * @throws Exception if the resource cannot be created
   * @private
   */
  async _bulkCreate_createResource(resourceEntity, collectionIndex, callbacks) {
    callbacks = callbacks || {};
    const successCallback = callbacks.successCallback || (() => {});
    const errorCallback = callbacks.errorCallback || (() => {});

    try {
      /*
       * Here we create entity just like in this.create
       * but we don't add the resource entity in the local storage just yet,
       * we wait until all resources are created in order to speed things up
       */
      const data = resourceEntity.toDto({secrets: true});
      const contain = {permission: true, favorite: true, tags: true, folder: true};
      const resourceDto = await this.resourceService.create(data, contain);
      const createdResourceEntity = new ResourceEntity(resourceDto);
      successCallback(createdResourceEntity, collectionIndex);
      return createdResourceEntity;
    } catch (error) {
      console.error(error);
      errorCallback(error, collectionIndex);
      throw error;
    }
  }

  /**
   * Delete a bulk of resources
   * @param {Array<string>} resourcesIds collection The list of uuids to delete
   * @param {{successCallback: function, errorCallback: function}?} callbacks The intermediate operation callbacks
   * @returns {Promise<array<*>>}
   */
  async bulkDelete(resourcesIds, callbacks) {
    let result = [];

    // Parallelize the operations by chunk of BULK_OPERATION_SIZE operations.
    const chunks = splitBySize(resourcesIds, BULK_OPERATION_SIZE);
    for (const chunkIndex in chunks) {
      const chunk = chunks[chunkIndex];
      const promises = chunk.map(async(resourceId, mapIndex) => {
        const collectionIndex = (chunkIndex * BULK_OPERATION_SIZE) + mapIndex;
        return this._bulkDelete_deleteResource(resourceId, collectionIndex, callbacks);
      });

      const bulkPromises = await Promise.allSettled(promises);
      const intermediateResult = bulkPromises.map(promiseResult => promiseResult.value);
      result = [...result, ...intermediateResult];
    }

    return result;
  }

  /**
   * Delete a resource for the bulkDelete function.
   * @param {string} resourceId The resource to delete
   * @param {int} collectionIndex The index of the resource in the initial collection
   * @param {{successCallback: function, errorCallback: function}?} callbacks The intermediate operation callbacks
   * @returns {Promise<ResourceEntity|Error>}
   * @private
   */
  async _bulkDelete_deleteResource(resourceId, collectionIndex, callbacks) {
    callbacks = callbacks || {};
    const successCallback = callbacks.successCallback || (() => {});
    const errorCallback = callbacks.errorCallback || (() => {});

    try {
      await this.delete(resourceId);
      successCallback(collectionIndex);
    } catch (error) {
      console.error(error);
      errorCallback(error, collectionIndex);
      throw error;
    }
  }

  /*
   * ==============================================================
   *  Secret plaintext serialization
   * ==============================================================
   */
  /**
   * Return plaintext ready to be encrypted
   * Based on resource type and plaintext
   *
   * @param {string|undefined} resourceTypeId The resource type uuid
   * @param {string|object} plaintextDto The secret to encrypt
   * @throws {TypeError} if resourceTypeId is invalid or the type definition is not found
   * @returns {Promise<string>}
   */
  async serializePlaintextDto(resourceTypeId, plaintextDto) {
    // If legacy resource (no resource type available or the plaintextDto is a string)
    if (!resourceTypeId || typeof plaintextDto === 'string') {
      if (plaintextDto.length > MAX_LENGTH_PLAINTEXT) {
        throw new TypeError(`The secret should be maximum ${MAX_LENGTH_PLAINTEXT} characters in length.`);
      }
      return plaintextDto;
    }

    const schema = await this.resourceTypeModel.getSecretSchemaById(resourceTypeId);
    if (!schema) {
      throw new TypeError('Could not find the schema definition for the requested resource type.');
    }
    const plaintextEntity = new PlaintextEntity(plaintextDto, schema);
    return JSON.stringify(plaintextEntity);
  }

  /**
   * Return the secret as per the resource type schema definition
   *
   * @param {string|undefined} resourceTypeId The resource type uuid
   * @param {string} plaintext the secret data in plaintext
   * @throws {TypeError} if plaintext is not a string or resource id is not a valid uuid
   * @throws {SyntaxError} if plaintext is not a parsable JSON object (depends on secret schema definition)
   * @returns {Promise<string|PlaintextEntity>}
   */
  async deserializePlaintext(resourceTypeId, plaintext) {
    if (typeof plaintext !== 'string') {
      throw new TypeError('Could not deserialize secret, plaintext is not a string.');
    }
    if (!resourceTypeId) {
      return plaintext;
    }
    const schema = await this.resourceTypeModel.getSecretSchemaById(resourceTypeId);
    if (!schema) {
      throw new TypeError('Could not find the schema definition for the requested resource type.');
    }
    if (schema.type === 'string') {
      return plaintext;
    }
    try {
      const plaintextDto = JSON.parse(plaintext);
      return new PlaintextEntity(plaintextDto, schema);
    } catch (error) {
      console.error(error);
      /*
       * SyntaxError, json is not valid
       * TypeError schema does not match
       */
      return plaintext; // return 'broken' string
    }
  }

  /*
   * ==============================================================
   *  Associated data management
   * ==============================================================
   */
  /**
   * Update tag in associated resource local storage
   *
   * @param {string} tagId The previous tag id
   * @param {TagEntity} tagEntity The tag entity which replace the previous tag
   * @returns {Promise<boolean>} if tag was present and updated
   */
  async replaceTagLocally(tagId, tagEntity) {
    const localResources = await ResourceLocalStorage.get();
    const resourceCollection = new ResourcesCollection(localResources);
    if (resourceCollection.replaceTag(tagId, tagEntity)) {
      await ResourceLocalStorage.set(resourceCollection);
      return true;
    }
    return false;
  }

  /**
   * Replace tags for a given resource in local storage
   * Doesn't udpate the tags remotely, use tagModel for this instead
   *
   * @param {string} resourceId
   * @param {TagsCollection} tagsCollection
   * @returns {Promise<ResourceEntity>}
   */
  async replaceResourceTagsLocally(resourceId, tagsCollection) {
    const resourceDto = await ResourceLocalStorage.getResourceById(resourceId);
    const resourceEntity = new ResourceEntity(resourceDto);
    resourceEntity.tags = tagsCollection;
    await ResourceLocalStorage.updateResource(resourceEntity);
    return resourceEntity;
  }

  /**
   * Update multiple resources tags in local storage
   * Doesn't update the tags remotely, use tagModel for this instead
   *
   * @param {Array<string>} resourceIds
   * @param {Array<TagsCollection>} tagsCollections
   * @returns {Promise<Array<ResourceEntity>>}
   */
  async bulkReplaceResourceTagsLocally(resourceIds, tagsCollections) {
    const resourcesDto = await ResourceLocalStorage.get();
    const resourceCollection = new ResourcesCollection(resourcesDto);
    await resourceCollection.bulkReplaceTagsCollection(resourceIds, tagsCollections);
    await ResourceLocalStorage.set(resourceCollection);
  }

  /**
   * Remove a tag from resource local storage
   *
   * @param tagId
   * @returns {Promise<boolean>} true if deleted false if not present
   */
  async deleteTagsLocally(tagId) {
    const localResources = await ResourceLocalStorage.get();
    const resourceCollection = new ResourcesCollection(localResources);
    if (resourceCollection.removeTagById(tagId)) {
      await ResourceLocalStorage.set(resourceCollection);
      return true;
    }
    return false;
  }

  /**
   * Update a favorite association of a resource in local storage
   * Doesn't udpate the favorite remotely, use favoriteModel for this instead
   *
   * @param {string} resourceId
   * @param {FavoriteEntity|null} favoriteEntity or null
   * @return {Promise<void>}
   */
  async updateFavoriteLocally(resourceId, favoriteEntity) {
    const resourceDto = await ResourceLocalStorage.getResourceById(resourceId);
    const resourceEntity = new ResourceEntity(resourceDto);
    resourceEntity.favorite = favoriteEntity;
    await ResourceLocalStorage.updateResource(resourceEntity);
  }

  /*
   * ==============================================================
   *  Assertions
   * ==============================================================
   */
  /**
   * Assert that all the folders are in the local storage
   *
   * @param {Array} resourceIds array of uuid
   * @throws {Error} if a resource does not exist
   */
  async assertResourcesExist(resourceIds) {
    const resources = await ResourceLocalStorage.get();
    if (!Array.isArray(resourceIds)) {
      throw new TypeError(`Resources exist check expect an array of uuid.`);
    }
    for (const i in resourceIds) {
      if (!resources.find(item => item.id === resourceIds[i])) {
        return false;
      }
    }
    return true;
  }


  /**
   * Keep only resources supported with no or known resource type
   * @param resourcesDto
   * @return {Promise<*[]>}
   */
  async keepResourcesSupported(resourcesDto) {
    const resourceTypesCollection = await this.resourceTypeModel.getOrFindAll();
    return resourcesDto.filter(resource => !resource.resource_type_id || resourceTypesCollection.isResourceTypeIdPresent(resource.resource_type_id));
  }
}

export default ResourceModel;
