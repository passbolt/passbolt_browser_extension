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
const {PermissionEntity} = require('../entity/permission/permissionEntity');
const {PermissionsCollection} = require('../entity/permission/permissionsCollection');
const {PermissionChangesCollection} = require("../../model/entity/permission/permissionChangesCollection");
const {FolderEntity} = require('../entity/folder/folderEntity');
const {FolderLocalStorage} = require('../../service/local_storage/folderLocalStorage');
const {FolderService} = require('../../service/api/folder/folderService');

class FolderModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.folderService = new FolderService(apiClientOptions);
  }

  /**
   * Update the folders local storage with the latest API folders the user has access.
   *
   * @return {Promise<[FolderEntity]>}
   */
  async updateLocalStorage () {
    const folders = await this.findAll();
    await FolderLocalStorage.set(folders);
    return folders;
  }

  /**
   * Get all folders from API and map API result to folder Entity
   *
   * @throws {Error} if API call fails, service unreachable, etc.
   * @return {Array<FolderEntity>} folders
   */
  async findAll() {
    const body = await this.folderService.findAll({permission: true});
    return body.map(folder => new FolderEntity(folder));
  }

  /**
   * Get all folders from API and map API result to folder Entity
   *
   * @return {Array<FolderEntity>} folders
   */
  async findAllForShare(foldersIds) {
    return await this.folderService.findAllForShare(foldersIds);
    // TODO map to entities
    //return body.map(folder => FolderEntity.fromApiData(folder));
  }

  /**
   *
   * @param {FolderEntity} folderEntity
   * @returns {Promise<PermissionsCollection>}
   */
  async cloneParentPermissions(folderEntity) {
    // get parent from api
    const parentDto = await this.folderService.get(folderEntity.folderParentId, {permissions: true});
    const parentFolder = new FolderEntity(parentDto);

    // clone parent permission for this new folder
    const permissions = new PermissionsCollection([], false);
    for (let parentPermission of parentFolder.permissions) {
      let clone = parentPermission.copyForAnotherAco(PermissionEntity.ACO_FOLDER, folderEntity.id);
      permissions.addOrReplace(clone);
    }
    return permissions;
  }

  /**
   * Create a folder using Passbolt API and add result to local storage
   *
   * @param {FolderEntity} folderEntity
   * @returns {Promise<FolderEntity>}
   */
  async create(folderEntity) {
    const folderDto = await this.folderService.create(folderEntity.toDto(), {permission: true});
    const updatedFolderEntity = new FolderEntity(folderDto);
    await FolderLocalStorage.addFolder(updatedFolderEntity);
    return updatedFolderEntity;
  }

  /***
   * Update folder permission by matching the parent permissions
   *
   * @param {FolderEntity} folderEntity
   * @param {boolean} [keepOwnership] optional, default true
   * @returns {Promise<FolderEntity>}
   */
  async applyPermissionFromParent(folderEntity, keepOwnership) {
    if (folderEntity.folderParentId) {
      const currentPermissions = new PermissionsCollection([folderEntity.permission]);
      const targetPermissions = await this.cloneParentPermissions(folderEntity);

      // Keep ownership / don't transfer folder
      if (typeof keepOwnership === 'undefined' || keepOwnership) {
        targetPermissions.addOrReplace(folderEntity.permission);
      }

      const changes = PermissionChangesCollection.buildChangesFromPermissions(currentPermissions, targetPermissions);
      folderEntity = await this.updatePermissions(folderEntity, changes);
    }
    return folderEntity;
  }

  /**
   * Update a folder using Passbolt API
   *
   * @param {FolderEntity} folderEntity
   * @returns {Promise<FolderEntity>}
   */
  async update(folderEntity) {
    const folderDto = await this.folderService.update(folderEntity.id, folderEntity.toDto(), {permission: true});
    const updatedFolderEntity = new FolderEntity(folderDto);
    await FolderLocalStorage.updateFolder(updatedFolderEntity);
    return updatedFolderEntity;
  }

  /**
   * Update a folder using Passbolt API
   *
   * @param {FolderEntity} folderEntity
   * @param {PermissionChangesCollection} changesCollection
   * @param {boolean} [updateStorage] optional, default true, in case you want to update only after bulk update
   * @returns {Promise<FolderEntity>}
   */
  async updatePermissions(folderEntity, changesCollection, updateStorage) {
    if (typeof updateStorage === 'undefined') {
      updateStorage = true;
    }
    await this.folderService.updatePermissions(folderEntity.id, {permissions: changesCollection.toDto()});
    if (updateStorage) {
      // update storage in case the folder becomes non visible to current user
      // TODO: optimize update only the given folder when user lost access
      await this.updateLocalStorage();
    }
    return folderEntity;
  }

  /**
   * Delete a folder using Passbolt API
   *
   * @param {string} folderId uuid
   * @param {boolean} [cascade] delete sub folder / folders
   * @returns {Promise<void>}
   */
  async delete(folderId, cascade) {
    await this.folderService.delete(folderId, cascade);
    await FolderLocalStorage.delete(folderId);
    if (cascade) {
      // update storage and get updated sub folders list in case some are deleted
      // TODO: optimize update only if folder contains subfolders
      await this.updateLocalStorage();
    }
  }
}

exports.FolderModel = FolderModel;
