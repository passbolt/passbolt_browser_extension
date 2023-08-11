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
 * @since         4.2.0
 */
import browser from "../../sdk/polyfill/browserPolyfill";
import Log from "../../model/log";
import UserRememberMeLatestChoiceEntity from "../../model/entity/rememberMe/userRememberMeLatestChoiceEntity";

export const REMEMBER_ME_LATEST_CHOICE_LOCAL_STORAGE_KEY = 'userRememberMeLatestChoice';

class UserRememberMeLatestChoiceLocalStorage {
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
      throw new Error('Cannot retrieve account id, necessary to get a rememberMe storage key.');
    }
    return `${REMEMBER_ME_LATEST_CHOICE_LOCAL_STORAGE_KEY}-${account.id}`;
  }

  /**
   * Flush the rememberMe local storage
   * @throws {Error} if operation failed
   * @return {Promise<void>}
   */
  async flush() {
    Log.write({level: 'debug', message: 'UserRememberMeLatestChoiceLocalStorage flushed'});
    await browser.storage.local.remove(this.storageKey);
  }

  /**
   * Set the UserRememberMeLatestChoice local storage.
   * @throws {Error} if operation failed
   * @return {Promise<UserRememberMeLatestChoiceEntity|null>} the rememberMe entity or null by default.
   */
  async get() {
    const value = await browser.storage.local.get([this.storageKey]);
    if (!value || !value[this.storageKey]) {
      return null;
    }

    // ensure this feature is not breaking anything by returning an accepted default value
    try {
      return new UserRememberMeLatestChoiceEntity(value[this.storageKey]);
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  /**
   * Set the rememberMe in local storage.
   * @param {UserRememberMeLatestChoiceEntity} rememberMeLatestChoiceEntity the value to save.
   * @return {Promise<void>}
   */
  async set(rememberMeLatestChoiceEntity) {
    await navigator.locks.request(this.storageKey, async() => {
      await browser.storage.local.set({[this.storageKey]: rememberMeLatestChoiceEntity.toDto()});
    });
  }
}

export default UserRememberMeLatestChoiceLocalStorage;
