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
 * @since         4.6.0
 */
import browser from "../../sdk/polyfill/browserPolyfill";
import Log from "../../model/log";

export const PASSBOLT_DATA_LOCAL_STORAGE_KEY = '_passbolt_data';

class PassboltDataLocalStorage {
  /**
   * Get the storage key.
   * @returns {string}
   */
  get storageKey() {
    return PASSBOLT_DATA_LOCAL_STORAGE_KEY;
  }

  /**
   * Flush the _passbolt_data local storage
   * @return {Promise<void>}
   */
  async flush() {
    Log.write({level: 'debug', message: 'PassboltDataLocalStorage flushed'});
    await browser.storage.local.remove(this.storageKey);
  }

  /**
   * Get the _passbolt_data local storage.
   * @throws {Error} if operation failed
   * @return {Promise<Object|null>} the _passbolt_data object or null by default.
   */
  async get() {
    const value = await browser.storage.local.get([this.storageKey]);
    if (!value?.[this.storageKey]) {
      console.error(new Error("Passbolt data read attempted on an empty storage."));
      return null;
    }

    return value[this.storageKey];
  }

  /**
   * Set the _passbolt_data in local storage.
   * @param {Object} passboltConfig the value to save.
   * @return {Promise<void>}
   */
  async set(passboltData) {
    await navigator.locks.request(this.storageKey, async() => {
      await browser.storage.local.set({[this.storageKey]: passboltData});
    });
  }
}

export default PassboltDataLocalStorage;
