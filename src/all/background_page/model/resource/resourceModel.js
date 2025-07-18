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
import ResourceService from "../../service/api/resource/resourceService";
import PlaintextEntity from "../entity/plaintext/plaintextEntity";

const MAX_LENGTH_PLAINTEXT = 4096;

class ResourceModel {
  /**
   * Constructor
   * @param {ApiClientOptions} apiClientOptions
   * @param {AccountEntity} account the user account
   * @public
   */
  constructor(apiClientOptions) {
    this.resourceService = new ResourceService(apiClientOptions);
    this.resourceTypeModel = new ResourceTypeModel(apiClientOptions);
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
   * @deprecated should use getOrFindResourcesService and collection filtering. See shareFoldersService usage.
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
   * @deprecated should use getOrFindResourcesService and collection filtering.
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
   * @deprecated should use getOrFindResourcesService and collection filtering.
   */
  async getById(resourceId) {
    const resourceDto = await ResourceLocalStorage.getResourceById(resourceId);
    return new ResourceEntity(resourceDto);
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
    let remainingPermissions = new PermissionsCollection([], {assertAtLeastOneOwner: false});

    // Remove permissions from parent if any
    if (parentFolder !== null) {
      if (!resource.permissions || !parentFolder.permissions) {
        throw new TypeError('Resource model calculatePermissionsChangesForMove requires permissions to be set.');
      }
      remainingPermissions = PermissionsCollection.diff(resource.permissions, parentFolder.permissions, false);
    }
    // Add parent permissions
    let permissionsFromParent = new PermissionsCollection([], {assertAtLeastOneOwner: false});
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
   * @param {boolean?} [ignoreInvalidEntity] Should invalid entities be ignored.
   * @returns {Promise<ResourcesCollection>}
   */
  async findAll(contains, filters, orders, ignoreInvalidEntity) {
    let resourcesDto = await this.resourceService.findAll(contains, filters, orders);
    resourcesDto = await this.keepResourcesSupported(resourcesDto);
    return new ResourcesCollection(resourcesDto, {clone: false, ignoreInvalidEntity: ignoreInvalidEntity});
  }

  /*
   * ==============================================================
   *  CRUD
   * ==============================================================
   */
  /**
   * Update resources in the local storage
   *
   * @param {ResourcesCollection} resourcesCollection
   * @returns {Promise<void>}
   */
  async updateCollection(resourcesCollection) {
    await ResourceLocalStorage.updateResourcesCollection(resourcesCollection);
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

    const plaintextEntity = new PlaintextEntity(plaintextDto, {schema});
    return JSON.stringify(plaintextEntity);
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
   * @returns {Promise<void>}
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
   * Assert that all resources are in the local storage
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
        throw new Error(`Resource with id ${resourceIds[i]} does not exist.`);
      }
    }
  }
}

export default ResourceModel;
