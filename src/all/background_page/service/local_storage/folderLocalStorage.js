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
const {Lock} = require('../../utils/lock');
const {FolderEntity} = require('../../model/entity/folder/folderEntity');

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
    return await browser.storage.local.remove(FOLDER_LOCAL_STORAGE_KEY);
  };

  /**
   * Set the folders local storage.
   * @throws {Error} if operation failed
   * @return {Promise} results object, containing every object in keys that was found in the storage area.
   * If storage is not set, undefined will be returned.
   */
  static async get() {
    let {folders} = await browser.storage.local.get([FOLDER_LOCAL_STORAGE_KEY]);
    return folders;
  };

  /**
   * Set the folders local storage.
   * @param {array} folderEntities The folders to insert in the local storage.
   */
  static async set(folderEntities) {
    await lock.acquire();
    const folders = [];
    if (folderEntities) {
      if (!Array.isArray(folderEntities)) {
        throw new TypeError('FolderLocalStorage::set expects an array of FolderEntity');
      }
      folderEntities.forEach((folderEntity) => {
        if (!(folderEntity instanceof FolderEntity)) {
          throw new TypeError('FolderLocalStorage::set expects an array of FolderEntity');
        }
        folders.push(folderEntity.toDto());
      })
    }
    const result = await browser.storage.local.set({folders});
    lock.release();
    return result;
  };

  /**
   * Get a folder from the local storage by id
   * @param {string} id The folder id
   * @return {object} The folder object
   */
  static async getFolderById(id) {
    const folders = await FolderLocalStorage.get();
    return folders.find(item => item.id === id);
  };

  /**
   * Add a folder in the local storage
   * @param {FolderEntity} folderEntity
   */
  static async addFolder(folderEntity) {
    await lock.acquire();
    try {
      const folders = await FolderLocalStorage.get();
      folders.push(folderEntity.toDto());
      await browser.storage.local.set({folders});
      lock.release();
    } catch (error) {
      lock.release();
      throw error;
    }
  };

  /**
   * Update a folder in the local storage.
   * @param {FolderEntity} folderEntity The folder to update
   */
  static async updateFolder(folderEntity) {
    await lock.acquire();
    try {
      const folders = await FolderLocalStorage.get();
      const folderIndex = folders.findIndex(item => item.id === folderEntity.id);
      folders[folderIndex] = Object.assign(folders[folderIndex], folderEntity.toDto());
      await browser.storage.local.set({folders});
      lock.release();
    } catch (error) {
      lock.release();
      throw error;
    }
  };

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
        await browser.storage.local.set({folders});
        lock.release();
      }
    } catch (error) {
      lock.release();
      throw error;
    }
  };
}

// Flush the local storage when this library is loaded
FolderLocalStorage.flush();

// Flush the local storage when the passbolt user session is terminated
window.addEventListener("passbolt.global.auth.logged-out", () => {
  FolderLocalStorage.flush();
});

// Flush the local storage when a window is closed.
// Strategy to catch the browser close event.
browser.tabs.onRemoved.addListener((tabId, evInfo) => {
  if (evInfo.isWindowClosing) {
    FolderLocalStorage.flush();
  }
});

exports.FolderLocalStorage = FolderLocalStorage;
