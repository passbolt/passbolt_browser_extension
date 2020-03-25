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
 * @since         2.11.0
 */

const Lock = require('../../utils/lock').Lock;
const lock = new Lock();
const Log = require('../../model/log').Log;

class ResourceLocalStorage { }

/**
 * Flush the resources local storage
 */
ResourceLocalStorage.flush = async function () {
  Log.write({level: 'debug', message: 'ResourceLocalStorage::flush flush resources local storage'});
  return await browser.storage.local.remove("resources");
};

/**
 * Set the resources local storage.
 */
ResourceLocalStorage.get = async function () {
  const { resources } = await browser.storage.local.get(["resources"]);
  return resources;
};

/**
 * Set the resources local storage.
 * @param {array} resources The resources to insert in the local storage.
 */
ResourceLocalStorage.set = async function (resources) {
  await lock.acquire();
  const result = await browser.storage.local.set({ resources });
  lock.release();
  return result;
};

/**
 * Get a resource from the local storage by id
 * @param {string} id The resource id
 * @param {object} The resource object
 */
ResourceLocalStorage.getResourceById = async function (id) {
  const resources = await ResourceLocalStorage.get();
  const resource = resources.find(item => item.id === id);
  return resource;
};

/**
 * Add a resource in the local storage
 */
ResourceLocalStorage.addResource = async function (resource) {
  await lock.acquire();
  try {
    const resources = await ResourceLocalStorage.get();
    resources.push(resource);
    await browser.storage.local.set({ resources });
    lock.release();
  } catch (error) {
    lock.release();
    throw error;
  }
};

/**
 * Update a resource in the local storage.
 * @param {object} resource The resource to update
 */
ResourceLocalStorage.updateResource = async function (resource) {
  await lock.acquire();
  try {
    const resources = await ResourceLocalStorage.get();
    const resourceIndex = resources.findIndex(item => item.id === resource.id);
    resources[resourceIndex] = resource;
    await browser.storage.local.set({ resources });
    lock.release();
  } catch(error) {
    lock.release();
    throw error;
  }
};


/**
 * Delete resources in the local storage by resources ids.
 * @param {array} resourcesIds The list of resource ids
 */
ResourceLocalStorage.deleteResourcesById = async function (resourcesIds) {
  await lock.acquire();
  try {
    const resources = await ResourceLocalStorage.get();
    if (resources) {
      resourcesIds.forEach(resourceId => {
        const resourceIndex = resources.findIndex(item => item.id === resourceId);
        if (resourceIndex !== -1) {
          resources.splice(resourceIndex, 1);
        }
      });
      await browser.storage.local.set({ resources });
      lock.release();
    }
  } catch(error) {
    lock.release();
    throw error;
  }
};

// Flush the local storage when this library is loaded
ResourceLocalStorage.flush();

// Flush the local storage when the passbolt user session is terminated
window.addEventListener("passbolt.auth.logged-out", () => {
  ResourceLocalStorage.flush();
});

// Flush the local storage when a window is closed.
// Strategy to catch the browser close event.
browser.tabs.onRemoved.addListener((tabId, evInfo) => {
  if (evInfo.isWindowClosing) {
    ResourceLocalStorage.flush();
  }
});

exports.ResourceLocalStorage = ResourceLocalStorage;
