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
 * @since         5.5.0
 */
export const BROWSER_EXTENSION_UPDATED_LOCAL_STORAGE_KEY = "passboltExtensionUpdated";

export default class BrowserExtensionUpdatedLocalStorage {
  /**
   * @constructor
   */
  constructor() {
    this.storageKey = this.getStorageKey();
  }

  /**
   * Get the storage key.
   * @returns {string}
   * @private
   */
  getStorageKey() {
    return BROWSER_EXTENSION_UPDATED_LOCAL_STORAGE_KEY;
  }

  /**
   * Flush the BrowserExtensionUpdated local storage .
   * @return {Promise<void>}
   */
  async flush() {
    await browser.storage.local.remove(this.storageKey);
    console.debug('BrowserExtensionUpdatedLocalStorage flushed');
  }

  /**
   * Get the time at when the reload has been requested.
   * @return {Promise<number>}
   */
  async get() {
    const data = await browser.storage.local.get([this.storageKey]);
    return data[this.storageKey];
  }

  /**
   * Set the trusted metadata key in the local storage.
   * @param {number} timestamp the timestamp at when the extra reload has been requested.
   * @return {Promise<void>}
   * @throws {TypeError} If timestamp is not of type number.
   */
  async set(timestamp) {
    if (!Number.isInteger(timestamp)) {
      throw new TypeError("Parameter `timestamp` should be of type number");
    }

    await navigator.locks.request(this.storageKey, async() => {
      await browser.storage.local.set({[this.storageKey]: timestamp});
    });
  }
}
