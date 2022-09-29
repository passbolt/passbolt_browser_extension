/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.8.0
 */
import browser from "webextension-polyfill";

/**
 * Utility class to provide a chrome.storage.session polyfill.
 * The polyfill isn't full and is tailored to the specific needs of Passbolt.
 */
class SessionStorage {
  constructor() {
    this._storedData = {};
  }

  /**
   * Retrieves one or more items from the storage area.
   * @param {string} key the key id to retrieve from the store
   * @returns {Promise<object>}
   */
  async get(key) {
    const keyType = typeof key;
    if (keyType !== "string" && keyType !== "undefined") {
      throw new Error(`Expected keys type of "string" but received an unsopprted type: ${keyType}`);
    }

    if (!key) {
      return this._storedData;
    }

    const result = this._storedData[key]
      ? {[key]: this._storedData[key]}
      : {};

    return result;
  }

  /**
   * Stores one or more items in the storage area. If the item exists, its value is updated.
   * @param {object} keys an object set as a key/value pair.
   * @returns {Promise<void>}
   */
  async set(keys) {
    if (typeof keys !== "object") {
      throw new Error(`Expected keys type of "object" but received an unsopprted type: ${typeof keys}`);
    }
    for (const key in keys) {
      this._storedData[key] = JSON.parse(JSON.stringify(keys[key]));
    }
  }

  /**
   * Removes one or more items from the storage area.
   * @param {string} keys A string, or array of strings, representing the key(s) of the item(s) to be removed.
   * @returns {Promise<void>}
   */
  async remove(key) {
    delete this._storedData[key];
  }

  /**
   * Removes all items from the storage area.
   * @returns {Promise<void>}
   */
  async clear() {
    this._storedData = {};
  }
}

if (!browser.storage.session) {
  browser.storage.session = new SessionStorage();
}
