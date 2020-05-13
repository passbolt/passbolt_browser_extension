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
const {ResourceEntity} = require('../entity/resource/resourceEntity');
const {ResourcesCollection} = require('../entity/resource/resourcesCollection');
const {ResourceLocalStorage} = require('../../service/local_storage/resourceLocalStorage');
const {ResourceService} = require('../../service/api/resource/resourceService');

const {PermissionEntity} = require('../entity/permission/permissionEntity');
const {PermissionsCollection} = require('../entity/permission/permissionsCollection');
const {PermissionChangesCollection} = require("../../model/entity/permission/permissionChangesCollection");

const {MoveService} = require('../../service/api/move/moveService');

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
  }

  /**
   * Update the resources local storage with the latest API resources the user has access.
   *
   * @return {ResourcesCollection}
   */
  async updateLocalStorage () {
    const resourceDtos = await this.resourceService.findAll(ResourceLocalStorage.DEFAULT_CONTAIN);
    const resourcesCollection = new ResourcesCollection(resourceDtos);
    await ResourceLocalStorage.set(resourcesCollection);
    return resourcesCollection;
  }

  //==============================================================
  // Local storage getters
  //==============================================================
  /**
   * Get a folder collection from the local storage by id
   *
   * @param {Array} folderIds The folder id
   * @return {ResourcesCollection}
   */
  async getAllByParentIds(folderIds) {
    const localResources = await ResourceLocalStorage.get();
    const resourcesCollection = new ResourcesCollection([]);
    for (let i in folderIds) {
      let resourceDto = localResources[i].id
      if (folderIds.includes(resourceDto.folder_parent_id)) {
        resourcesCollection.push(resourceDto);
      }
    }
    return resourcesCollection;
  };

  /**
   * Get a collection of resources from the local storage by id
   *
   * @param {Array} resourceIds The resource ids
   * @return {ResourcesCollection}
   */
  async getAllByIds(resourceIds) {
    const localResources = await ResourceLocalStorage.get();
    const resourcesCollection = new ResourcesCollection([]);
    for (let i in resourceIds) {
      let resourceDto = localResources[i].id
      if (resourceIds.includes(resourceDto.id)) {
        resourcesCollection.push(resourceDto);
      }
    }
    return resourcesCollection;
  };

  /**
   * Get a collection of resources from the local storage by id
   * Where the user is the owner
   *
   * @param {Array} resourceIds The resource ids
   * @return {ResourcesCollection}
   */
  async getAllByIdsWhereOwner(resourceIds) {
    const localResources = await ResourceLocalStorage.get();
    const resourcesCollection = new ResourcesCollection([]);
    for (let i in resourceIds) {
      let resourceDto = localResources[i].id
      if (resourceIds.includes(resourceDto.id) && resourceDto.permission.type === PermissionEntity.PERMISSION_OWNER) {
        resourcesCollection.push(resourceDto);
      }
    }
    return resourcesCollection;
  }

  //==============================================================
  // Permission changes
  //==============================================================
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
   * @returns {Promise<PermissionChangesCollection>}
   */
  async calculatePermissionsChangesForMove(resource, parentFolder, destFolder) {
    let remainingPermissions = new PermissionsCollection([], false);

    // Remove permissions from parent if any
    if (resource.folderParentId !== null) {
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

    let newPermissions = PermissionsCollection.sum(remainingPermissions, permissionsFromParent, false);
    if (!destFolder) {
      // If the move is toward the root
      // Reuse highest permission
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
    let changes = null
    if (destFolder) {
      if (!destFolder.permissions) {
        throw new TypeError('Resource model calculatePermissionsChangesForMove requires destination permissions to be set.');
      }
      const currentPermissions = new PermissionsCollection([resource.permission]);
      const permissionsFromDest = destFolder.permissions.cloneForAco(PermissionEntity.ACO_RESOURCE, resource.id);
      changes = PermissionChangesCollection.calculateChanges(currentPermissions, permissionsFromDest)
    }
    return changes;
  }

  //==============================================================
  // Finders
  //==============================================================
  /**
   * Find all for share
   *
   * @param {array} resourcesIds resource uuids
   * @returns {Promise<ResourcesCollection>}
   */
  async findAllForShare (resourcesIds) {
    let resourcesDto = await this.resourceService.findAllForShare(resourcesIds);
    return new ResourcesCollection(resourcesDto);
  };

  /**
   * Find a resource to share
   *
   * @param {string} resourcesId resource uuid
   * @returns {Promise<ResourceEntity>}
   */
  async findForShare (resourcesId) {
    let resourcesDto = await this.resourceService.findAllForShare([resourcesId]);
    return new ResourceEntity(resourcesDto[0]);
  };

  //==============================================================
  // CRUD
  //==============================================================
  /**
   * Create a resource using Passbolt API and add result to local storage
   *
   * @param {ResourceEntity} resourceEntity
   * @returns {Promise<ResourceEntity>}
   */
  async create(resourceEntity) {
    const resourceDto = await this.resourceService.create(resourceEntity.toDto({secrets:true}), {permission:true});
    const updatedResourceEntity = new ResourceEntity(resourceDto);
    await ResourceLocalStorage.addResource(updatedResourceEntity);
    return updatedResourceEntity;
  }

  /**
   * Move a folder using Passbolt API
   *
   * @param {string} resourceId the resource id
   * @param {(string|null)} folderParentId the folder parent
   * @returns {ResourceEntity}
   */
  async move(resourceId, folderParentId) {
    const resourceDto = await ResourceLocalStorage.getResourceById(resourceId);
    const resourceEntity = new ResourceEntity(resourceDto);
    resourceEntity.folderParentId = folderParentId;
    await this.moveService.move(resourceEntity);
    // TODO update modified date
    await ResourceLocalStorage.updateResource(resourceEntity);

    return resourceEntity;
  }

  //==============================================================
  // Assertions
  //==============================================================
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
    for (let i in resourceIds) {
      if (!resources.find(item => item.id === resourceIds[i])) {
        return false;
      }
    }
    return true;
  }
}

exports.ResourceModel = ResourceModel;
