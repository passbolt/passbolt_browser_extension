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
import browser from "../../sdk/polyfill/browserPolyfill";
import Log from "../../model/log";
import FolderEntity from "../../model/entity/folder/folderEntity";
import FoldersCollection from "../../model/entity/folder/foldersCollection";
import Lock from "../../utils/lock";
const lock = new Lock();

const FOLDER_LOCAL_STORAGE_KEY = 'folders';

class FolderLocalStorage {
  /**
   * Flush the folders local storage
   *
   * @throws {Error} if operation failed
   * @return {Promise<void>}
   */
  static async flush() {
    Log.write({level: 'debug', message: 'FolderLocalStorage flushed'});
    return await browser.storage.local.remove(FolderLocalStorage.FOLDER_LOCAL_STORAGE_KEY);
  }

  /**
   * Set the folders local storage.
   *
   * @throws {Error} if operation failed
   * @return {Promise} results object, containing every object in keys that was found in the storage area.
   * If storage is not set, undefined will be returned.
   */
  static async get() {
    const {folders} = await browser.storage.local.get([FolderLocalStorage.FOLDER_LOCAL_STORAGE_KEY]);
    return folders;
  }

  /**
   * Set the folders local storage.
   *
   * @param {FoldersCollection} foldersCollection The folders to insert in the local storage.
   * @return {void}
   */
  static async set(foldersCollection) {
    await lock.acquire();
    const folders = [];
    if (!(foldersCollection instanceof FoldersCollection)) {
      throw new TypeError('FolderLocalStorage::set expects a FoldersCollection');
    }
    for (const folderEntity of foldersCollection) {
      FolderLocalStorage.assertEntityBeforeSave(folderEntity);
      folders.push(folderEntity.toDto(FolderLocalStorage.DEFAULT_CONTAIN));
    }
    await browser.storage.local.set({folders: folders});
    lock.release();
  }

  /**
   * Get a folder from the local storage by id
   *
   * @param {string} id The folder id
   * @return {object} a folder dto
   */
  static async getFolderById(id) {
    const folders = await FolderLocalStorage.get();
    return folders.find(item => item.id === id);
  }

  /**
   * Get a folder from the local storage by id
   *
   * @param {(string|null)} id The folder id
   * @return {object} a folder dto
   */
  static async getFolderByParentId(id) {
    const folders = await FolderLocalStorage.get();
    return folders.find(item => item.folderParentId === id);
  }

  /**
   * Add a folder in the local storage
   * @param {FolderEntity} folderEntity
   */
  static async addFolder(folderEntity) {
    await lock.acquire();
    try {
      FolderLocalStorage.assertEntityBeforeSave(folderEntity);
      const folders = await FolderLocalStorage.get();
      folders.push(folderEntity.toDto(FolderLocalStorage.DEFAULT_CONTAIN));
      await browser.storage.local.set({folders: folders});
      lock.release();
    } catch (error) {
      lock.release();
      throw error;
    }
  }

  /**
   * Add multiple folders to the local storage
   * @param {Array<FolderEntity>} folderEntities
   */
  static async addFolders(folderEntities) {
    await lock.acquire();
    try {
      const folders = await FolderLocalStorage.get();
      folderEntities.forEach(folderEntity => {
        FolderLocalStorage.assertEntityBeforeSave(folderEntity);
        folders.push(folderEntity.toDto(FolderLocalStorage.DEFAULT_CONTAIN));
      });
      await browser.storage.local.set({folders: folders});
      lock.release();
    } catch (error) {
      lock.release();
      throw error;
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
      const folders = await FolderLocalStorage.get();
      const folderIndex = folders.findIndex(item => item.id === folderEntity.id);
      if (folderIndex === -1) {
        throw new Error('The folder could not be found in the local storage');
      }
      folders[folderIndex] = Object.assign(folders[folderIndex], folderEntity.toDto(FolderLocalStorage.DEFAULT_CONTAIN));
      await browser.storage.local.set({folders: folders});
      lock.release();
    } catch (error) {
      lock.release();
      throw error;
    }
  }

  /**
   * Delete folders in the local storage by folders ids.
   * @param {string} folderId folder uuid
   */
  static async delete(folderId) {
    await lock.acquire();
    try {
      const folders = await FolderLocalStorage.get();
      if (folders) {
        const folderIndex = folders.findIndex(item => item.id === folderId);
        if (folderIndex !== -1) {
          folders.splice(folderIndex, 1);
        }
        await browser.storage.local.set({folders: folders});
        lock.release();
      }
    } catch (error) {
      lock.release();
      throw error;
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
   * FolderLocalStorage.FOLDER_LOCAL_STORAGE_KEY
   * @returns {string}
   * @constructor
   */
  static get FOLDER_LOCAL_STORAGE_KEY() {
    return FOLDER_LOCAL_STORAGE_KEY;
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
