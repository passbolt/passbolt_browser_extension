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
 * @since         4.10.1
 */
import AccountEntity from "../../model/entity/account/accountEntity";
import SessionKeysBundlesCollection from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysBundlesCollection";

export const SESSION_KEYS_BUNDLES_SESSION_STORAGE_KEY = "session_keys_bundles";

class SessionKeysBundlesSessionStorageStorageService {
  /**
   * Runtime cached data.
   * @type {Object} Key: account_id, value: cached data as dto.
   * @private
   */
  static _runtimeCachedData = {};

  /**
   * Constructor
   * @param account the user account
   */
  constructor(account) {
    if (!account || !(account instanceof AccountEntity)) {
      throw new TypeError("Parameter `account` should be of type AccountEntity.");
    }
    this.account = account;
    this.storageKey = this.getStorageKey(account);
  }

  /**
   * Get the storage key.
   * @param {AbstractAccountEntity} account The account to get the key for.
   * @returns {string}
   * @throws {Error} If it cannot retrieve account id.
   */
  getStorageKey(account) {
    return `${SESSION_KEYS_BUNDLES_SESSION_STORAGE_KEY}-${account.id}`;
  }

  /**
   * Check if there is cached data.
   * @returns {boolean}
   */
  hasCachedData() {
    return Boolean(SessionKeysBundlesSessionStorageStorageService._runtimeCachedData[this.account.id]);
  }

  /**
   * Flush the session keys bundles from session storage and runtime cached data.
   * @return {Promise<void>}
   */
  async flush() {
    await browser.storage.session.remove(this.storageKey);
    delete SessionKeysBundlesSessionStorageStorageService._runtimeCachedData[this.account.id];
    console.debug(`SessionKeysBundlesSessionStorageStorage flushed for (${this.account.id})`);
  }

  /**
   * Get the session keys bundle from the session storage.
   * @return {Promise<object|undefined>}
   */
  async get() {
    if (!SessionKeysBundlesSessionStorageStorageService._runtimeCachedData[this.account.id]) {
      const data = await browser.storage.session.get([this.storageKey]);
      if (!data[this.storageKey]) {
        return;
      }
      SessionKeysBundlesSessionStorageStorageService._runtimeCachedData[this.account.id] = data[this.storageKey];
    }

    return SessionKeysBundlesSessionStorageStorageService._runtimeCachedData[this.account.id];
  }

  /**
   * Set the session keys bundles in the session storage.
   * @param {SessionKeysBundlesCollection} collection The session keys bundles to insert in the session storage.
   * @return {Promise<void>}
   * @throws {TypeError} If parameter settings is not of type SessionKeysBundlesCollection.
   */
  async set(collection) {
    if (!collection || !(collection instanceof SessionKeysBundlesCollection)) {
      throw new TypeError("Parameter `sessionKeysBundles` should be of type SessionKeysBundlesCollection");
    }
    if (collection.length > 0 && collection.hasSomeEncryptedSessionKeysBundles()) {
      throw new TypeError("The parameter `collection` should contain only decrypted keys.");
    }
    await navigator.locks.request(this.storageKey, async() => {
      const sessionKeysBundlesDto = collection.toDto();
      await this._setBrowserStorage({[this.storageKey]: sessionKeysBundlesDto});
      SessionKeysBundlesSessionStorageStorageService._runtimeCachedData[this.account.id] = sessionKeysBundlesDto;
    });
  }

  /**
   * Set the browser storage.
   * @todo Tool to test the semaphore. A dedicated session storage service could be implemented later on top
   * of the browser provided one to ease the testing.
   * @param {object} data The data to store in the session storage.
   * @returns {Promise<void>}
   * @private
   */
  async _setBrowserStorage(data) {
    await browser.storage.session.set(data);
  }
}

export default SessionKeysBundlesSessionStorageStorageService;
