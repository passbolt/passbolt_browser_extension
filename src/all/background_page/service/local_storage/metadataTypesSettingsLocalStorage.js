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
 * @since         4.10.0
 */
import MetadataTypesSettingsEntity
  from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity";
import AccountEntity from "../../model/entity/account/accountEntity";

export const METADATA_TYPES_SETTINGS_LOCAL_STORAGE_KEY = "metadata_types_settings";

class MetadataTypesSettingsLocalStorage {
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
    return `${METADATA_TYPES_SETTINGS_LOCAL_STORAGE_KEY}-${account.id}`;
  }

  /**
   * Flush the metadata types settings from local storage and runtime cached data.
   * @return {Promise<void>}
   */
  async flush() {
    await browser.storage.local.remove(this.storageKey);
    delete MetadataTypesSettingsLocalStorage._runtimeCachedData[this.account.id];
    console.debug(`MetadataTypesSettingsLocalStorage flushed for (${this.account.id})`);
  }

  /**
   * Get the metadata types settings from the local storage.
   * @return {Promise<object|undefined>}
   */
  async get() {
    if (!MetadataTypesSettingsLocalStorage._runtimeCachedData[this.account.id]) {
      const data = await browser.storage.local.get([this.storageKey]);
      if (!data[this.storageKey]) {
        return;
      }
      MetadataTypesSettingsLocalStorage._runtimeCachedData[this.account.id] = data[this.storageKey];
    }

    return MetadataTypesSettingsLocalStorage._runtimeCachedData[this.account.id];
  }

  /**
   * Set the metadata types settings in the local storage.
   * @param {MetadataTypesSettingsEntity} settings The settings to insert in the local storage.
   * @return {Promise<void>}
   * @throws {TypeError} If parameter settings is not of type MetadataTypesSettingsEntity.
   */
  async set(settings) {
    if (!settings || !(settings instanceof MetadataTypesSettingsEntity)) {
      throw new TypeError("Parameter `settings` should be of type MetadataTypesSettingsEntity");
    }
    await navigator.locks.request(this.storageKey, async() => {
      const settingsDto = settings.toDto();
      await this._setBrowserStorage({[this.storageKey]: settingsDto});
      MetadataTypesSettingsLocalStorage._runtimeCachedData[this.account.id] = settingsDto;
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

export default MetadataTypesSettingsLocalStorage;
