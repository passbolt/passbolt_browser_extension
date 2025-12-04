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
 * @since         5.8.0
 */
import Log from "../../model/log";
import AutofillSettingEntity from "../../model/entity/autofillSetting/autofillSettingEntity";

export const AUTOFILL_SETTING_LOCAL_STORAGE_KEY = 'autofillSetting';

class AutofillSettingLocalStorage {
  /**
   * Constructor
   * @param {AbstractAccountEntity} account the user account
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
      throw new Error('Cannot retrieve account id, necessary to get an autofill setting storage key.');
    }
    return `${AUTOFILL_SETTING_LOCAL_STORAGE_KEY}-${account.id}`;
  }

  /**
   * Flush the autofill setting local storage
   * @return {Promise<void>}
   */
  async flush() {
    Log.write({level: 'debug', message: 'AutofillSettingLocalStorage flushed'});
    await browser.storage.local.remove(this.storageKey);
  }

  /**
   * Get the AutofillSetting from local storage.
   * @throws {Error} if operation failed
   * @return {Promise<AutofillSettingEntity>} the autofill setting entity or default if not set.
   */
  async get() {
    const value = await browser.storage.local.get([this.storageKey]);
    if (!value || !value[this.storageKey]) {
      return AutofillSettingEntity.createFromDefault();
    }

    try {
      return new AutofillSettingEntity(value[this.storageKey]);
    } catch (e) {
      console.error(e);
      return AutofillSettingEntity.createFromDefault();
    }
  }

  /**
   * Set the autofill setting in local storage.
   * @param {AutofillSettingEntity} autofillSettingEntity the value to save.
   * @return {Promise<void>}
   */
  async set(autofillSettingEntity) {
    await navigator.locks.request(this.storageKey, async() => {
      await browser.storage.local.set({[this.storageKey]: autofillSettingEntity.toDto()});
    });
  }
}

export default AutofillSettingLocalStorage;
