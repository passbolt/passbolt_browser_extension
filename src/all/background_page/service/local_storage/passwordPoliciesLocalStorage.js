/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.2.0
 */
import browser from "../../sdk/polyfill/browserPolyfill";
import Log from "../../model/log";
import PasswordPoliciesEntity from "../../model/entity/passwordPolicies/passwordPoliciesEntity";

export const PASSWORD_POLICIES_LOCAL_STORAGE_KEY = 'passwordPolicies';

class PasswordPoliciesLocalStorage {
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
      throw new Error('Cannot retrieve account id, necessary to get a rbac storage key.');
    }
    return `${PASSWORD_POLICIES_LOCAL_STORAGE_KEY}-${account.id}`;
  }

  /**
   * Flush the rbacs local storage
   * @throws {Error} if operation failed
   * @return {Promise<void>}
   */
  async flush() {
    Log.write({level: 'debug', message: 'PasswordPoliciesLocalStorage flushed'});
    return await browser.storage.local.remove(this.storageKey);
  }

  /**
   * Set the password policies local storage.
   * @throws {Error} if operation failed
   * @return {Promise<PasswordPoliciesEntity|undefined>} results object, containing every object in keys that was found in the storage area.
   * If storage is not set, undefined will be returned.
   */
  async get() {
    const passwordPolicies = await browser.storage.local.get([this.storageKey]);
    return passwordPolicies[this.storageKey];
  }

  /**
   * Set the password policies in local storage.
   * @param {PasswordPoliciesEntity} passwordPoliciesEntity The password policies to insert in the local storage.
   * @return {Promise<void>}
   */
  async set(passwordPoliciesEntity) {
    PasswordPoliciesLocalStorage.assertEntityBeforeSave(passwordPoliciesEntity);

    await navigator.locks.request(this.storageKey, async() => {
      const passwordPoliciesDto = passwordPoliciesEntity.toDto(PasswordPoliciesEntity.ALL_CONTAIN_OPTIONS);
      await browser.storage.local.set({[this.storageKey]: passwordPoliciesDto});
    });
  }

  /*
   * =================================================
   * Static methods
   * =================================================
   */
  /**
   * Make sure the entity meet some minimal requirements before being stored
   *
   * @param {PasswordPoliciesEntity} rbacEntity
   * @throws {TypeError} if requirements are not met
   * @private
   */
  static assertEntityBeforeSave(passwordPoliciesEntity) {
    if (!passwordPoliciesEntity) {
      throw new TypeError('PasswordPoliciesLocalStorage expects a PasswordPoliciesEntity to be set');
    }
    if (!(passwordPoliciesEntity instanceof PasswordPoliciesEntity)) {
      throw new TypeError('PasswordPoliciesLocalStorage expects an object of type PasswordPoliciesEntity');
    }
  }
}

export default PasswordPoliciesLocalStorage;
