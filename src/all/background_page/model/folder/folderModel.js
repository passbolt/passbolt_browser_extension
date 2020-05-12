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
const {FolderEntity} = require('../entity/folder/folderEntity');
const {FoldersCollection} = require("../entity/folder/foldersCollection");
const {FolderLocalStorage} = require('../../service/local_storage/folderLocalStorage');
const {FolderService} = require('../../service/api/folder/folderService');
const {MoveService} = require('../../service/api/move/moveService');
const {ShareService} = require('../../service/api/share/shareService');

const {PermissionEntity} = require('../entity/permission/permissionEntity');
const {PermissionsCollection} = require('../entity/permission/permissionsCollection');
const {PermissionChangesCollection} = require("../../model/entity/permission/permissionChangesCollection");

class FolderModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.folderService = new FolderService(apiClientOptions);
    this.moveService = new MoveService(apiClientOptions);
    this.shareService = new ShareService(apiClientOptions);
  }

  /**
   * Update the folders local storage with the latest API folders the user has access.
   *
   * @return {FoldersCollection}
   */
  async updateLocalStorage () {
    const foldersCollection = await this.findAll();
    await FolderLocalStorage.set(foldersCollection);
    return foldersCollection;
  }

  // ============================================
  // Finders
  // ============================================
  /**
   * Get all folders from API and map API result to folder Entity
   *
   * @throws {Error} if API call fails, service unreachable, etc.
   * @return {FoldersCollection}
   */
  async findAll() {
    const foldersDtos = await this.folderService.findAll({permission: true});
    return new FoldersCollection(foldersDtos);
  }

  /**
   * Get all folders from API and map API result to folder collection
   *
   * @return {FoldersCollection}
   */
  async findAllForShare(foldersIds) {
    const foldersDtos = await this.folderService.findAllForShare(foldersIds);
    return new FoldersCollection(foldersDtos);
  }

  /**
   * Get folder from API and map API result to folder Entity
   *
   * @return {FolderEntity}
   */
  async findForShare(folderId) {
    const foldersDtos = await this.folderService.findAllForShare([folderId]);
    if (!foldersDtos.length) {
      throw new Error(`Folder ${folderId} not found`);
    }
    return new FolderEntity(foldersDtos[0]);
  }

  /**
   * Get folder permission
   *
   * @param {string} folderId folderId
   * @returns {Promise<PermissionsCollection>}
   */
  async findFolderPermissions(folderId) {
    const folderDto = await this.folderService.get(folderId, {permissions: true});
    const folderEntity = new FolderEntity(folderDto);
    return folderEntity.permissions;
  }

  // ============================================
  // Local storage getters
  // ============================================
  /**
   * Get a folder collection from the local storage by ids
   * Also include their children
   *
   * @param {array} folderIds The folder ids
   * @param {boolean} [withChildren] optional default false
   * @return {FoldersCollection}
   */
  async getAllByIds(folderIds, withChildren) {
    const foldersDto = await FolderLocalStorage.get();
    const inputCollection = new FoldersCollection(foldersDto);
    let outputCollection = new FoldersCollection([]);
    inputCollection.items.forEach((folderDto) => {
      if (folderIds.includes(folderDto.id)) {
        outputCollection.push(folderDto);
      }
    });
    if (withChildren) {
      folderIds.forEach(parentId => {
        outputCollection = FoldersCollection.getAllChildren(parentId, inputCollection, outputCollection);
      });
    }
    return outputCollection;
  };

  // ============================================
  // Assertions
  // ============================================
  /**
   * Assert for a given folder id that the folder is in the local storage
   *
   * @param {(string|null)} folderId folderId
   * @throws {Error} if the folder does not exist
   */
  async assertFolderExists(folderId) {
    if (folderId === null) {
      return;
    }
    if (!Validator.isUUID(folderId)) {
      throw new TypeError(`Folder exists check expect a uuid.`);
    }
    const folderDto = await FolderLocalStorage.getFolderById(folderId);
    if (!folderDto) {
      // TODO check remotely?
      throw new Error(`Folder with id ${folderId} does not exist.`);
    }
  }

  /**
   * Assert that all the folders are in the local storage
   *
   * @param {Array} folderIds array of uuid
   * @throws {Error} if a folder does not exist
   */
  async assertFoldersExist(folderIds) {
    if (!Array.isArray(folderIds)) {
      throw new TypeError(`Folders exist check expect an array of uuid.`);
    }
    for (let i in folderIds) {
      await this.assertFolderExists(folderIds[i]);
    }
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

  /**
   * Calculate permission changes for a create
   * From current permissions add the destination permissions
   *
   * NOTE: This function requires destFolder permissions to be set
   *
   * @param {FolderEntity} folderEntity
   * @param {(FolderEntity|null)} destFolder destination
   * @returns {Promise<PermissionChangesCollection>}
   */
  async calculatePermissionsChangesForCreate(folderEntity, destFolder) {
    let changes = null;
    if (folderEntity.folderParentId) {
      if (!destFolder.permissions) {
        throw new TypeError('Resource model calculatePermissionsChangesForMove requires destination permissions to be set.');
      }
      const currentPermissions = new PermissionsCollection([folderEntity.permission]);
      const targetPermissions = destFolder.permissions.cloneForAco(PermissionEntity.ACO_FOLDER, folderEntity.id);
      changes = PermissionChangesCollection.calculateChanges(currentPermissions, targetPermissions);
    }
    return changes;
  }

  /**
   * Move a folder using Passbolt API
   *
   * @param {string} folderId the folder to move
   * @param {string} folderParentId the destination folder
   * @returns {FolderEntity}
   */
  async move(folderId, folderParentId) {
    const folderDto = await FolderLocalStorage.getFolderById(folderId);
    const folderEntity = new FolderEntity(folderDto);
    folderEntity.folderParentId = folderParentId;
    await this.moveService.move(folderEntity);
    // TODO update modified date
    await FolderLocalStorage.updateFolder(folderEntity);

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
  async share(folderEntity, changesCollection, updateStorage) {
    if (typeof updateStorage === 'undefined') {
      updateStorage = true;
    }
    await this.shareService.shareFolder(folderEntity.id, {permissions: changesCollection.toDto()});
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
