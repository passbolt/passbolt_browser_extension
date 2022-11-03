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
 * @since         3.6.0
 */
import browser from "../../sdk/polyfill/browserPolyfill";
import AbstractAccountEntity from "../../model/entity/account/abstractAccountEntity";
import AwaitLock from "await-lock";

const lock = new AwaitLock();

const ACCOUNTS_LOCAL_STORAGE_KEY = 'accounts';

class AccountLocalStorage {
  /**
   * Get the accounts stored in the local storage.
   *
   * @throws {Error} if operation failed
   * @return {Promise} results object, containing every object in keys that was found in the storage area.
   * If storage is not set, undefined will be returned.
   */
  static async get() {
    const {accounts} = await browser.storage.local.get([ACCOUNTS_LOCAL_STORAGE_KEY]);
    return accounts || [];
  }

  /**
   * Get an account from the local storage by user_id
   *
   * @param {string} userId The user id
   * @param {string} type The account type
   * @return {object} account dto object
   */
  static async getAccountByUserIdAndType(userId, type) {
    const accounts = await AccountLocalStorage.get();
    return accounts.find(item => item.user_id === userId && item.type === type);
  }

  /**
   * Add an account in the local storage
   * @param {AbstractAccountEntity} accountEntity
   */
  static async add(accountEntity) {
    if (!(accountEntity instanceof AbstractAccountEntity)) {
      throw new TypeError('ResourceLocalStorage::add expects an AccountEntity');
    }

    await lock.acquireAsync();
    try {
      const accounts = await AccountLocalStorage.get();
      accounts.push(accountEntity.toDto(AccountLocalStorage.DEFAULT_CONTAIN));
      await browser.storage.local.set({[ACCOUNTS_LOCAL_STORAGE_KEY]: accounts});
      lock.release();
    } catch (error) {
      lock.release();
      throw error;
    }
  }

  /**
   * Delete an account in the local storage.
   * @param {string} userId The account user id
   * @param {string} type The account type
   */
  static async deleteByUserIdAndType(userId, type) {
    await lock.acquireAsync();
    try {
      const accounts = await AccountLocalStorage.get();
      if (accounts) {
        const filteredAccounts = accounts.filter(item => item.user_id !== userId || item.type !== type);
        await browser.storage.local.set({[ACCOUNTS_LOCAL_STORAGE_KEY]: filteredAccounts});
      }
      lock.release();
    } catch (error) {
      lock.release();
      throw error;
    }
  }

  /*
   * =================================================
   * Static methods
   * =================================================
   */
  /**
   * AccountLocalStorage.DEFAULT_CONTAIN
   *
   * @returns {Object}
   * @private
   */
  static get DEFAULT_CONTAIN() {
    return {
      user: true,
      security_token: true,
      authentication_token_token: true,
      account_recovery_request_id: true,
      user_private_armored_key: true,
    };
  }

  /**
   * AccountLocalStorage.ACCOUNTS_LOCAL_STORAGE_KEY
   *
   * @returns string
   */
  static get ACCOUNTS_LOCAL_STORAGE_KEY() {
    return ACCOUNTS_LOCAL_STORAGE_KEY;
  }
}

export default AccountLocalStorage;
