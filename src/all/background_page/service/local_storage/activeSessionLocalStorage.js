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
 * @since         6.0.0
 */
import OnlineSessionEntity from "passbolt-styleguide/src/shared/models/entity/session/onlineSessionEntity";
import Log from "../../model/log";
import { assertType } from "../../utils/assertions";
import AbstractAccountEntity from "../../model/entity/account/abstractAccountEntity";

export const ACTIVE_SESSION_LOCAL_STORAGE_KEY = "active_session";

class ActiveSessionLocalStorage {
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
    if (!account || !(account instanceof AbstractAccountEntity)) {
      throw new TypeError("Parameter `account` should be of type AbstractAccountEntity.");
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
    return `${ACTIVE_SESSION_LOCAL_STORAGE_KEY}-${account.id}`;
  }

  /**
   * Flush the active session from local storage and runtime cached data.
   * @return {Promise<void>}
   */
  async flush() {
    await browser.storage.local.remove(this.storageKey);
    delete ActiveSessionLocalStorage._runtimeCachedData[this.account.id];
    Log.write({ level: "debug", message: `ActiveSessionLocalStorage flushed for (${this.account.id})` });
  }

  /**
   * Get the active session from the local storage.
   * @return {Promise<object|undefined>}
   */
  async get() {
    if (!ActiveSessionLocalStorage._runtimeCachedData[this.account.id]) {
      const data = await browser.storage.local.get([this.storageKey]);
      if (!data[this.storageKey]) {
        return;
      }
      ActiveSessionLocalStorage._runtimeCachedData[this.account.id] = data[this.storageKey];
    }

    return ActiveSessionLocalStorage._runtimeCachedData[this.account.id];
  }

  /**
   * Set the active session in the local storage.
   * @param {OnlineSessionEntity} activeSession The active session to insert in the local storage.
   * @return {Promise<void>}
   * @throws {TypeError} If parameter settings is not of type OnlineSessionEntity.
   */
  async set(activeSession) {
    assertType(activeSession, OnlineSessionEntity, "Parameter `activeSession` should be of type OnlineSessionEntity");
    await navigator.locks.request(this.storageKey, async () => {
      const activeSessionDto = activeSession.toDto();
      await this._setBrowserStorage({ [this.storageKey]: activeSessionDto });
      ActiveSessionLocalStorage._runtimeCachedData[this.account.id] = activeSessionDto;
    });
  }

  /**
   * Set the browser storage.
   * @todo Tool to test the semaphore. A dedicated local storage service could be implemented later on top
   * of the browser provided one to ease the testing.
   * @param {object} data The data to store in the local storage.
   * @returns {Promise<void>}
   * @private
   */
  async _setBrowserStorage(data) {
    await browser.storage.local.set(data);
  }
}

export default ActiveSessionLocalStorage;
