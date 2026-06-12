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
import PermissionEntity from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity";
import PermissionsCollection from "passbolt-styleguide/src/shared/models/entity/permission/permissionsCollection";
import FolderEntity from "../entity/folder/folderEntity";
import FoldersCollection from "../entity/folder/foldersCollection";
import PermissionChangesCollection from "../entity/permission/change/permissionChangesCollection";
import FolderService from "../../service/api/folder/folderService";
import ShareApiService from "../../service/api/share/shareApiService";
import splitBySize from "../../utils/array/splitBySize";
import FindAndUpdateFoldersLocalStorageService from "../../service/folder/findAndUpdateFoldersLocalStorageService";

const BULK_OPERATION_SIZE = 5;

class FolderModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @param {AccountEntity} account the user account
   * @public
   */
  constructor(apiClientOptions, account) {
    this.folderService = new FolderService(apiClientOptions);
    this.shareApiService = new ShareApiService(apiClientOptions);
    this.findAndUpdateFoldersLocalStorageService = new FindAndUpdateFoldersLocalStorageService(
      account,
      apiClientOptions,
    );
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
   * @deprecated should use getOrFindResourcesService and collection filtering.
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
   * @return {Promise<FoldersCollection>}
   * @deprecated should use getOrFindResourcesService and collection filtering.
   */
  async getAllByIds(folderIds, withChildren) {
    const outputCollection = new FoldersCollection([]);
    const foldersDto = await FolderLocalStorage.get();
    if (foldersDto) {
      const inputCollection = new FoldersCollection(foldersDto);
      inputCollection.items.forEach((folderDto) => {
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

  /*
   * ==============================================================
   *  Permission changes
   * ==============================================================
   */
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
        throw new TypeError(
          "Resource model calculatePermissionsChangesForMove requires destination permissions to be set.",
        );
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
    const folderDto = await this.folderService.create(folderEntity.toDto(), { permission: true });
    const updatedFolderEntity = new FolderEntity(folderDto);
    await FolderLocalStorage.addFolder(updatedFolderEntity);
    return updatedFolderEntity;
  }

  /**
   * Update a folder using Passbolt API
   *
   * @param {FolderEntity} folderEntity
   * @returns {Promise<FolderEntity>}
   */
  async update(folderEntity) {
    const folderDto = await this.folderService.update(folderEntity.id, folderEntity.toDto(), { permission: true });
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
    await this.shareApiService.shareFolder(folderEntity.id, { permissions: changesCollection.toDto() });
    if (typeof updateStorage === "undefined" || updateStorage) {
      /*
       * update storage in case the folder becomes non visible to current user
       * TODO: optimize update only the given folder when user lost access
       */
      await this.findAndUpdateFoldersLocalStorageService.findAndUpdateAll();
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
      await this.findAndUpdateFoldersLocalStorageService.findAndUpdateAll();
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
      const promises = chunk.map(async (folderEntity, mapIndex) => {
        const collectionIndex = chunkIndex * BULK_OPERATION_SIZE + mapIndex;
        return this._bulkCreate_createFolder(folderEntity, collectionIndex, callbacks);
      });

      const bulkPromises = await Promise.allSettled(promises);
      const intermediateResult = bulkPromises.map((promiseResult) => promiseResult.value);
      result = [...result, ...intermediateResult];
    }

    // Insert the created folders into the local storage
    const createdFolders = result.filter((row) => row instanceof FolderEntity);
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
      const folderDto = await this.folderService.create(folderEntity.toDto(), { permission: true });
      const createdFolderEntity = new FolderEntity(folderDto);
      successCallback(createdFolderEntity, collectionIndex);
      return createdFolderEntity;
    } catch (error) {
      console.error(error);
      errorCallback(error, collectionIndex);
      throw error;
    }
  }
}

export default FolderModel;
