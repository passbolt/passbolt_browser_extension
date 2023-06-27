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
import browser from "../../sdk/polyfill/browserPolyfill";
import Log from "../../model/log";
import Lock from "../../utils/lock";
const lock = new Lock();

const AUTH_STATUS_STORAGE_KEY = 'auth_status';

class AuthStatusLocalStorage {
  /**
   * Flush the folders local storage
   *
   * @throws {Error} if operation failed
   * @return {Promise<void>}
   */
  static async flush() {
    Log.write({level: 'debug', message: 'AuthStatusLocalStorage flushed'});
    return await browser.storage.local.remove(AuthStatusLocalStorage.AUTH_STATUS_STORAGE_KEY);
  }

  /**
   * Set the folders local storage.
   *
   * @throws {Error} if operation failed
   * @return {Promise} results object, containing every object in keys that was found in the storage area.
   * If storage is not set, undefined will be returned.
   */
  static async get() {
    const result = await browser.storage.local.get([AuthStatusLocalStorage.AUTH_STATUS_STORAGE_KEY]);
    if (result) {
      return result[AuthStatusLocalStorage.AUTH_STATUS_STORAGE_KEY];
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
    await lock.acquire();
    isAuthenticated = isAuthenticated === true ? true : false;
    isMfaRequired = isMfaRequired === false ? false : true;
    const status = {};
    status[AuthStatusLocalStorage.AUTH_STATUS_STORAGE_KEY] = {isAuthenticated: isAuthenticated, isMfaRequired: isMfaRequired};
    await browser.storage.local.set(status);
    lock.release();
  }

  /**
   * AuthStatusLocalStorage.AUTH_STATUS_STORAGE_KEY
   * @returns {string}
   * @constructor
   */
  static get AUTH_STATUS_STORAGE_KEY() {
    return AUTH_STATUS_STORAGE_KEY;
  }
}

export default AuthStatusLocalStorage;
