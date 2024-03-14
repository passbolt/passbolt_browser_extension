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
 * @since         4.5.0
 */
import Log from "../../model/log";

export const PASSWORD_EXPIRY_SETTINGS_LOCAL_STORAGE_KEY = 'passwordExpirySettings';

class PasswordExpirySettingsLocalStorage {
  /**
   * Constructor
   * @param account the user account
   */
  constructor(account) {
    this.storageKey = this.getStorageKey(account);
  }

  /**
   * Get the storage key.
   * @param {AbstractAccountEntity} account The account to get the key for.
   * @returns {string}
   * @throws {Error} If it cannot retrieve account id.
   */
  getStorageKey(account) {
    if (!account.id) {
      throw new Error('Cannot retrieve account id, necessary to get the password expiry settings storage key.');
    }
    return `${PASSWORD_EXPIRY_SETTINGS_LOCAL_STORAGE_KEY}-${account.id}`;
  }

  /**
   * Flush the password expiry settings local storage
   * @throws {Error} if operation failed
   * @return {Promise<void>}
   */
  async flush() {
    Log.write({level: 'debug', message: 'PasswordExpirySettingsLocalStorage flushed'});
    return await browser.storage.local.remove(this.storageKey);
  }

  /**
   * Get the password expiry settings local storage.
   * @throws {Error} if operation failed
   * @return {Promise} results object, containing every object in keys that was found in the storage area.
   * If storage is not set, undefined will be returned.
   */
  async get() {
    const passwordExpirySettings = await browser.storage.local.get([this.storageKey]);
    return passwordExpirySettings[this.storageKey];
  }

  /**
   * Set the password expiry settings in local storage.
   * @param {Object} passwordExpirySettings The password expiry settings collection to insert in the local storage.
   * @return {void}
   */
  async set(passwordExpirySettings) {
    await navigator.locks.request(this.storageKey, async() => {
      await browser.storage.local.set({[this.storageKey]: passwordExpirySettings});
    });
  }
}

export default PasswordExpirySettingsLocalStorage;
