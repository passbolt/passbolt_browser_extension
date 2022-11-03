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
import FolderLocalStorage from "../../service/local_storage/folderLocalStorage";
import PermissionEntity from "../entity/permission/permissionEntity";
import PermissionsCollection from "../entity/permission/permissionsCollection";
import FolderEntity from "../entity/folder/folderEntity";
import FoldersCollection from "../entity/folder/foldersCollection";
import PermissionChangesCollection from "../entity/permission/change/permissionChangesCollection";
import MoveService from "../../service/api/move/moveService";
import FolderService from "../../service/api/folder/folderService";
import ShareService from "../../service/api/share/shareService";
import splitBySize from "../../utils/array/splitBySize";
import Validator from "validator";

const BULK_OPERATION_SIZE = 5;

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
  async updateLocalStorage() {
    const foldersCollection = await this.findAll();
    await FolderLocalStorage.set(foldersCollection);
    return foldersCollection;
  }

  /*
   * ============================================
   * Local storage getters
   * ============================================
   */
  /**
   * Return a folder for a given id from the local storage
   *
   * @param {string} folderId uuid
   * @returns {Promise<FolderEntity|null>}
   */
  async getById(folderId) {
    const folderDto = await FolderLocalStorage.getFolderById(folderId);
    return folderDto ? new FolderEntity(folderDto) : null;
  }

  /**
   * Get a folder collection from the local storage by ids
   * Also include their children
   *
   * @param {array} folderIds The folder ids
   * @param {boolean} [withChildren] optional default false
   * @return {FoldersCollection}
   */
  async getAllByIds(folderIds, withChildren) {
    const outputCollection = new FoldersCollection([]);
    const foldersDto = await FolderLocalStorage.get();
    if (foldersDto) {
      const inputCollection = new FoldersCollection(foldersDto);
      inputCollection.items.forEach(folderDto => {
        if (folderIds.includes(folderDto.id)) {
          outputCollection.push(folderDto);
        }
      });
      if (withChildren) {
        for (const i in folderIds) {
          const folderId = folderIds[i];
          const children = FoldersCollection.getAllChildren(folderId, inputCollection, outputCollection);
          outputCollection.merge(children);
        }
      }
    }
    return outputCollection;
  }

  /**
   * Get all the children for the folder provided as input
   *
   * @param {array} folderIds The folder ids
   * @return {FoldersCollection}
   */
  async getAllChildren(folderIds) {
    const foldersDto = await FolderLocalStorage.get();
    const inputCollection = new FoldersCollection(foldersDto);
    const outputCollection = new FoldersCollection([]);
    for (const i in folderIds) {
      const folderId = folderIds[i];
      const children = FoldersCollection.getAllChildren(folderId, inputCollection, outputCollection);
      outputCollection.merge(children);
    }
    return outputCollection;
  }

  /*
   * ============================================
   * Finders
   * ============================================
   */
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
    const contain = {'permissions.user.profile': true, 'permissions.group': true};
    const folderDto = await this.folderService.get(folderId, contain);
    const folderEntity = new FolderEntity(folderDto);
    return folderEntity.permissions;
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
   * @param {ResourceEntity} folderEntity
   * @param {(FolderEntity|null)} parentFolder
   * @param {(FolderEntity|null)} destFolder
   * @returns {PermissionChangesCollection}
   */
  calculatePermissionsChangesForMove(folderEntity, parentFolder, destFolder) {
    let remainingPermissions = new PermissionsCollection([], false);

    // Remove permissions from parent if any
    if (parentFolder) {
      if (!folderEntity.permissions || !parentFolder.permissions) {
        throw new TypeError('Resource model calculatePermissionsChangesForMove requires permissions to be set.');
      }
      remainingPermissions = PermissionsCollection.diff(folderEntity.permissions, parentFolder.permissions, false);
    }
    // Add parent permissions
    let permissionsFromParent = new PermissionsCollection([], false);
    if (destFolder) {
      if (!destFolder.permissions) {
        throw new TypeError('Resource model calculatePermissionsChangesForMove requires destination permissions to be set.');
      }
      permissionsFromParent = destFolder.permissions.cloneForAco(
        PermissionEntity.ACO_FOLDER, folderEntity.id, false
      );
    }

    const newPermissions = PermissionsCollection.sum(remainingPermissions, permissionsFromParent, false);
    if (!destFolder) {
      /*
       * If the move is toward the root
       * Reuse highest permission
       */
      newPermissions.addOrReplace(new PermissionEntity({
        aco: PermissionEntity.ACO_FOLDER,
        aco_foreign_key: folderEntity.id,
        aro: folderEntity.permission.aro,
        aro_foreign_key: folderEntity.permission.aroForeignKey,
        type: PermissionEntity.PERMISSION_OWNER,
      }));
    }
    newPermissions.assertAtLeastOneOwner();
    return PermissionChangesCollection.calculateChanges(folderEntity.permissions, newPermissions);
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

  /*
   * ==============================================================
   *  CRUD
   * ==============================================================
   */
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
    await this.shareService.shareFolder(folderEntity.id, {permissions: changesCollection.toDto()});
    if (typeof updateStorage === 'undefined' || updateStorage) {
      /*
       * update storage in case the folder becomes non visible to current user
       * TODO: optimize update only the given folder when user lost access
       */
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
      /*
       * update storage and get updated sub folders list in case some are deleted
       * TODO: optimize update only if folder contains subfolders
       */
      await this.updateLocalStorage();
    }
  }

  /**
   * Create a bulk of folders
   * @param {FoldersCollection} collection The collection of folders
   * @param {{successCallback: function, errorCallback: function}?} callbacks The intermediate operation callbacks
   * @returns {Promise<array<FolderEntity|Error>>}
   */
  async bulkCreate(collection, callbacks) {
    let result = [];

    // Parallelize the operations by chunk of BULK_OPERATION_SIZE operations.
    const chunks = splitBySize(collection.folders, BULK_OPERATION_SIZE);
    for (const chunkIndex in chunks) {
      const chunk = chunks[chunkIndex];
      const promises = chunk.map(async(folderEntity, mapIndex) => {
        const collectionIndex = (chunkIndex * BULK_OPERATION_SIZE) + mapIndex;
        return this._bulkCreate_createFolder(folderEntity, collectionIndex, callbacks);
      });

      const bulkPromises = await Promise.allSettled(promises);
      const intermediateResult = bulkPromises.map(promiseResult => promiseResult.value);
      result = [...result, ...intermediateResult];
    }

    // Insert the created folders into the local storage
    const createdFolders = result.filter(row => row instanceof FolderEntity);
    await FolderLocalStorage.addFolders(createdFolders);

    return result;
  }

  /**
   * Create a folder for the bulkCreate function.
   * @param {FolderEntity} folderEntity The folder to create
   * @param {int} collectionIndex The index of the folder in the initial collection
   * @param {{successCallback: function, errorCallback: function}?} callbacks The intermediate operation callbacks
   * @returns {Promise<FolderEntity>}
   * @throws Exception if the folder cannot be created
   * @private
   */
  async _bulkCreate_createFolder(folderEntity, collectionIndex, callbacks) {
    callbacks = callbacks || {};
    const successCallback = callbacks.successCallback || (() => {});
    const errorCallback = callbacks.errorCallback || (() => {});

    try {
      /*
       * Here we create entity just like in this.create
       * but we don't add the folder entity in the local storage just yet,
       * we wait until all folders are created in order to speed things up
       */
      const folderDto = await this.folderService.create(folderEntity.toDto(), {permission: true});
      const createdFolderEntity = new FolderEntity(folderDto);
      successCallback(createdFolderEntity, collectionIndex);
      return createdFolderEntity;
    } catch (error) {
      console.error(error);
      errorCallback(error, collectionIndex);
      throw error;
    }
  }

  /*
   * ============================================
   * Assertions
   * ============================================
   */
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
    for (const i in folderIds) {
      await this.assertFolderExists(folderIds[i]);
    }
  }
}

export default FolderModel;
