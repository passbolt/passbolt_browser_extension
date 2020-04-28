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

const Lock = require('../../utils/lock').Lock;
const lock = new Lock();

class FolderLocalStorage { }

/**
 * Flush the folders local storage
 */
FolderLocalStorage.flush = async function () {
  return await browser.storage.local.remove("folders");
};

/**
 * Set the folders local storage.
 */
FolderLocalStorage.get = async function () {
  let { folders } = await browser.storage.local.get(["folders"]);
  return folders;
};

/**
 * Set the folders local storage.
 * @param {array} folders The folders to insert in the local storage.
 */
FolderLocalStorage.set = async function (folders) {
  await lock.acquire();
  const result = await browser.storage.local.set({ folders });
  lock.release();
  return result;
};

/**
 * Get a folder from the local storage by id
 * @param {string} id The folder id
 * @return {object} The folder object
 */
FolderLocalStorage.getFolderById = async function (id) {
  const folders = await FolderLocalStorage.get();
  return folders.find(item => item.id === id);
};

/**
 * Add a folder in the local storage
 */
FolderLocalStorage.addFolder = async function (folder) {
  await lock.acquire();
  try {
    const folders = await FolderLocalStorage.get();
    folders.push(folder);
    await browser.storage.local.set({ folders });
    lock.release();
  } catch (error) {
    lock.release();
    throw error;
  }
};

/**
 * Update a folder in the local storage.
 * @param {object} folder The folder to update
 */
FolderLocalStorage.updateFolder = async function (folder) {
  await lock.acquire();
  try {
    const folders = await FolderLocalStorage.get();
    const folderIndex = folders.findIndex(item => item.id === folder.id);
    folders[folderIndex] = Object.assign(folders[folderIndex], folder);
    await browser.storage.local.set({ folders });
    lock.release();
  } catch(error) {
    lock.release();
    throw error;
  }
};

/**
 * Delete folders in the local storage by folders ids.
 * @param {string} folderId The list of folder ids
 */
FolderLocalStorage.delete = async function (folderId) {
  await lock.acquire();
  try {
    const folders = await FolderLocalStorage.get();
    if (folders) {
      const folderIndex = folders.findIndex(item => item.id === folderId);
      if (folderIndex !== -1) {
        folders.splice(folderIndex, 1);
      }
      await browser.storage.local.set({ folders });
      lock.release();
    }
  } catch(error) {
    lock.release();
    throw error;
  }
};

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
