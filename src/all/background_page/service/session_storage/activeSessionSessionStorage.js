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
import UserActiveSessionEntity from "passbolt-styleguide/src/shared/models/entity/session/userActiveSessionEntity";
import Log from "../../model/log";
import { assertType } from "../../utils/assertions";
import AbstractAccountEntity from "../../model/entity/account/abstractAccountEntity";

export const ACTIVE_SESSION_LOCAL_STORAGE_KEY = "active_session";

class ActiveSessionSessionStorage {
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
   * Check if there is cached data.
   * @returns {boolean}
   */
  hasCachedData() {
    return Boolean(ActiveSessionSessionStorage._runtimeCachedData[this.account.id]);
  }

  /**
   * Flush the active session from the session storage and runtime cached data.
   * @return {Promise<void>}
   */
  async flush() {
    await browser.storage.session.remove(this.storageKey);
    delete ActiveSessionSessionStorage._runtimeCachedData[this.account.id];
    Log.write({ level: "debug", message: `ActiveSessionSessionStorage flushed for (${this.account.id})` });
  }

  /**
   * Get the active session from the session storage.
   * @return {Promise<object|undefined>}
   */
  async get() {
    if (!ActiveSessionSessionStorage._runtimeCachedData[this.account.id]) {
      const data = await browser.storage.session.get(this.storageKey);
      if (!data[this.storageKey]) {
        return;
      }
      ActiveSessionSessionStorage._runtimeCachedData[this.account.id] = data[this.storageKey];
    }

    return ActiveSessionSessionStorage._runtimeCachedData[this.account.id];
  }

  /**
   * Set the active session in the session storage.
   * @param {UserActiveSessionEntity} activeSession The active session to insert in the session storage.
   * @return {Promise<void>}
   * @throws {TypeError} If parameter settings is not of type UserActiveSessionEntity.
   */
  async set(activeSession) {
    assertType(
      activeSession,
      UserActiveSessionEntity,
      "Parameter `activeSession` should be of type UserActiveSessionEntity",
    );
    await navigator.locks.request(this.storageKey, async () => {
      const activeSessionDto = activeSession.toDto();
      await this._setBrowserStorage({ [this.storageKey]: activeSessionDto });
      ActiveSessionSessionStorage._runtimeCachedData[this.account.id] = activeSessionDto;
    });
  }

  /**
   * Set the browser storage.
   * @todo Tool to test the semaphore. A dedicated local storage service could be implemented later on top
   * of the browser provided one to ease the testing.
   * @param {object} data The data to store in the session storage.
   * @returns {Promise<void>}
   * @private
   */
  async _setBrowserStorage(data) {
    await browser.storage.session.set(data);
  }
}

export default ActiveSessionSessionStorage;
