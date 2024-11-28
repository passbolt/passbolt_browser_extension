/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.13.0
 */
import Log from "../../model/log";
import FolderEntity from "../../model/entity/folder/folderEntity";
import FoldersCollection from "../../model/entity/folder/foldersCollection";
import Lock from "../../utils/lock";
import {assertArray, assertUuid} from "../../utils/assertions";
const lock = new Lock();

export const FOLDERS_LOCAL_STORAGE_KEY = 'folders';

class FolderLocalStorage {
  /**
   * Cached data.
   * @type {Object}
   * @private
   */
  static _cachedData = null;

  /**
   * Check if there is cached data.
   * @returns {boolean}
   */
  static hasCachedData() {
    return FolderLocalStorage._cachedData !== null;
  }

  /**
   * Flush the folders local storage
   *
   * @throws {Error} if operation failed
   * @return {Promise<void>}
   */
  static async flush() {
    Log.write({level: 'debug', message: 'FolderLocalStorage flushed'});
    await browser.storage.local.remove(FOLDERS_LOCAL_STORAGE_KEY);
    FolderLocalStorage._cachedData = null;
  }

  /**
   * Set the folders local storage.
   *
   * @throws {Error} if operation failed
   * @return {Promise} results object, containing every object in keys that was found in the storage area.
   * If storage is not set, undefined will be returned.
   */
  static async get() {
    if (!FolderLocalStorage._cachedData) {
      const {folders} = await browser.storage.local.get([FOLDERS_LOCAL_STORAGE_KEY]);
      FolderLocalStorage._cachedData = folders;
    }
    return FolderLocalStorage._cachedData;
  }

  /**
   * Set the folders local storage.
   *
   * @param {FoldersCollection} foldersCollection The folders to insert in the local storage.
   * @return {Promise<void>}
   */
  static async set(foldersCollection) {
    await lock.acquire();
    try {
      const folders = [];
      if (!(foldersCollection instanceof FoldersCollection)) {
        throw new TypeError('FolderLocalStorage::set expects a FoldersCollection');
      }
      for (const folderEntity of foldersCollection) {
        FolderLocalStorage.assertEntityBeforeSave(folderEntity);
        folders.push(folderEntity.toDto(FolderLocalStorage.DEFAULT_CONTAIN));
      }
      await browser.storage.local.set({folders: folders});
      FolderLocalStorage._cachedData = folders;
    } finally {
      lock.release();
    }
  }

  /**
   * Get a folder from the local storage by id
   *
   * @param {string} id The folder id
   * @return {object} a folder dto
   */
  static async getFolderById(id) {
    const folders = await FolderLocalStorage.get();
    return folders?.find(item => item.id === id);
  }

  /**
   * Get a folder from the local storage by folder parent id
   *
   * @param {(string|null)} id The folder parent id
   * @return {object} a folder dto
   */
  static async getFolderByParentId(id) {
    const folders = await FolderLocalStorage.get();
    return folders?.find(item => item.folder_parent_id === id);
  }

  /**
   * Add a folder in the local storage
   * @param {FolderEntity} folderEntity
   */
  static async addFolder(folderEntity) {
    await lock.acquire();
    try {
      FolderLocalStorage.assertEntityBeforeSave(folderEntity);
      const folders = await FolderLocalStorage.get() || [];
      folders.push(folderEntity.toDto(FolderLocalStorage.DEFAULT_CONTAIN));
      await browser.storage.local.set({folders: folders});
      FolderLocalStorage._cachedData = folders;
    } finally {
      lock.release();
    }
  }

  /**
   * Add multiple folders to the local storage
   * @param {Array<FolderEntity>} folderEntities
   */
  static async addFolders(folderEntities) {
    assertArray(folderEntities, "The parameter foldersEntities should be an array");
    await lock.acquire();
    try {
      const folders = await FolderLocalStorage.get() || [];
      folderEntities.forEach(folderEntity => {
        FolderLocalStorage.assertEntityBeforeSave(folderEntity);
        folders.push(folderEntity.toDto(FolderLocalStorage.DEFAULT_CONTAIN));
      });
      await browser.storage.local.set({folders: folders});
      FolderLocalStorage._cachedData = folders;
    } finally {
      lock.release();
    }
  }

  /**
   * Update a folder in the local storage.
   *
   * @param {FolderEntity} folderEntity The folder to update
   * @throws {Error} if the folder does not exist in the local storage
   */
  static async updateFolder(folderEntity) {
    await lock.acquire();
    try {
      FolderLocalStorage.assertEntityBeforeSave(folderEntity);
      const folders = await FolderLocalStorage.get() || [];
      const folderIndex = folders.findIndex(item => item.id === folderEntity.id);
      if (folderIndex === -1) {
        throw new Error('The folder could not be found in the local storage');
      }
      folders[folderIndex] = folderEntity.toDto(FolderLocalStorage.DEFAULT_CONTAIN);
      await browser.storage.local.set({folders: folders});
      FolderLocalStorage._cachedData = folders;
    } finally {
      lock.release();
    }
  }

  /**
   * Delete folders in the local storage by folders ids.
   * @param {string} folderId folder uuid
   */
  static async delete(folderId) {
    assertUuid(folderId, "The parameter folderId should be a UUID.");
    await lock.acquire();
    try {
      const folders = await FolderLocalStorage.get() || [];
      if (folders.length > 0) {
        const folderIndex = folders.findIndex(item => item.id === folderId);
        if (folderIndex !== -1) {
          folders.splice(folderIndex, 1);
        }
        await browser.storage.local.set({folders: folders});
        FolderLocalStorage._cachedData = folders;
      }
    } finally {
      lock.release();
    }
  }

  /**
   * FolderLocalStorage.DEFAULT_CONTAIN
   * Warning: To be used for entity serialization not service API contain!
   *
   * @returns {Object}
   * @private
   */
  static get DEFAULT_CONTAIN() {
    return {permission: true};
  }

  /**
   * Make sure the entity meet some minimal requirements before being stored
   *
   * @param {FolderEntity} folderEntity
   * @throw {TypeError} if requirements are not met
   * @private
   */
  static assertEntityBeforeSave(folderEntity) {
    if (!folderEntity) {
      throw new TypeError('FolderLocalStorage expects a FolderEntity to be set');
    }
    if (!(folderEntity instanceof FolderEntity)) {
      throw new TypeError('FolderLocalStorage expects an object of type FolderEntity');
    }
    if (!folderEntity.id) {
      throw new TypeError('FolderLocalStorage expects FolderEntity id to be set');
    }
    if (!folderEntity.permission) {
      throw new TypeError('FolderLocalStorage::set expects FolderEntity permission to be set');
    }
  }
}

export default FolderLocalStorage;
