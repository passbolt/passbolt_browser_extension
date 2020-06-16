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
const {Log} = require('../../model/log');
const {Lock} = require('../../utils/lock');
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
  };

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
  };

  /**
   * Set the folders local storage.
   *
   * @param {boolean} isAuthenticated
   * @param {boolean} isMfaRequired
   * @return {void}
   */
  static async set(isAuthenticated, isMfaRequired) {
    await lock.acquire();
    isAuthenticated = isAuthenticated === true ? true : false;
    isMfaRequired = isMfaRequired === false ? false : true;
    const status = {};
    status[AuthStatusLocalStorage.AUTH_STATUS_STORAGE_KEY] = {isAuthenticated, isMfaRequired};
    await browser.storage.local.set(status);
    lock.release();
  };

  /**
   * AuthStatusLocalStorage.AUTH_STATUS_STORAGE_KEY
   * @returns {string}
   * @constructor
   */
  static get AUTH_STATUS_STORAGE_KEY() {
    return AUTH_STATUS_STORAGE_KEY;
  }

  /**
   * Init sessions status local storage
   */
  static init() {
    // Flush the local storage when this library is loaded
    this.flush();

    // Flush the local storage when the passbolt user session is terminated
    window.addEventListener("passbolt.global.auth.logged-out", () => {
      this.flush();
    });

    // Flush the local storage when a window is closed.
    // Strategy to catch the browser close event.
    browser.tabs.onRemoved.addListener((tabId, evInfo) => {
      if (evInfo.isWindowClosing) {
        this.flush();
      }
    });
  }
}

exports.AuthStatusLocalStorage = AuthStatusLocalStorage;
