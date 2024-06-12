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
 * @since         2.13.4
 */
import Log from "../../model/log";

const AUTH_STATUS_STORAGE_KEY = '';

class AuthStatusLocalStorage {
  /**
   * Get the storage key.
   */
  static get storageKey() {
    return AUTH_STATUS_STORAGE_KEY;
  }

  /**
   * Flush the folders local storage
   *
   * @throws {Error} if operation failed
   * @return {Promise<void>}
   */
  static async flush() {
    Log.write({level: 'debug', message: 'AuthStatusLocalStorage flushed'});
    return await browser.storage.local.remove(this.storageKey);
  }

  /**
   * Set the folders local storage.
   *
   * @throws {Error} if operation failed
   * @return {Promise} results object, containing every object in keys that was found in the storage area.
   * If storage is not set, undefined will be returned.
   */
  static async get() {
    const result = await browser.storage.local.get([this.storageKey]);
    if (result) {
      return result[this.storageKey];
    }
    return undefined;
  }

  /**
   * Set the folders local storage.
   *
   * @param {boolean} isAuthenticated
   * @param {boolean} isMfaRequired
   * @return {Promise<void>}
   */
  static async set(isAuthenticated, isMfaRequired) {
    await navigator.locks.request(this.storageKey, async() => {
      const auth_status = {
        isAuthenticated: Boolean(isAuthenticated),
        isMfaRequired: Boolean(isMfaRequired),
      };
      await browser.storage.local.set({[this.storageKey]: auth_status});
    });
  }
}

export default AuthStatusLocalStorage;
