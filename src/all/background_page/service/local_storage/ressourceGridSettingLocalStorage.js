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
 * @since         4.3.0
 */
import GridUserSettingEntity from "passbolt-styleguide/src/shared/models/entity/gridUserSetting/gridUserSettingEntity";

export const RESOURCE_GRID_USER_SETTING_STORAGE_KEY = 'resourceGridUserSetting';

class ResourceGridUserSettingLocalStorage {
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
      throw new Error('Cannot retrieve account id, necessary to get the resource columns setting storage key.');
    }
    return `${RESOURCE_GRID_USER_SETTING_STORAGE_KEY}-${account.id}`;
  }

  /**
   * Get the resource grid user setting in local storage.
   * @return {Promise<GridUserSettingEntity> | null} the grid user setting entity or null by default.
   */
  async get() {
    const value = await browser.storage.local.get([this.storageKey]);
    if (!value || !value[this.storageKey]) {
      return null;
    }

    try {
      return new GridUserSettingEntity(value[this.storageKey]);
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  /**
   * Set the resource grid setting in local storage.
   * @param {GridUserSettingEntity} gridUserSettingEntity the value to save.
   * @return {Promise<void>}
   */
  async set(gridUserSettingEntity) {
    await navigator.locks.request(this.storageKey, async() => {
      await browser.storage.local.set({[this.storageKey]: gridUserSettingEntity.toJSON()});
    });
  }
}

export default ResourceGridUserSettingLocalStorage;
