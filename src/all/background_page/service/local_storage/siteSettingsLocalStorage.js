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
import SiteSettingsEntity from "passbolt-styleguide/src/shared/models/entity/siteSettings/siteSettingsEntity";
import AccountEntity from "../../model/entity/account/accountEntity";

export const SITE_SETTINGS = "site-settings";

/**
 * Per-account local storage for site settings, backed by `browser.storage.local`
 * under the key `site-settings-{accountId}`, with an in-memory runtime cache.
 */
class SiteSettingsLocalStorage {
  /**
   * Runtime cached data.
   * @key {string} account id
   * @value {object} site settings dto
   * @private
   */
  static _runtimeCachedData = {};

  /**
   * @param {AccountEntity} account The user account.
   */
  constructor(account) {
    if (!account || !(account instanceof AccountEntity)) {
      throw new TypeError("Parameter `account` should be of type AccountEntity.");
    }
    this.account = account;
    this.storageKey = this.getStorageKey(account);
  }

  /**
   * Build the storage key for the given account.
   * @param {AccountEntity} account
   * @returns {string}
   */
  getStorageKey(account) {
    return `${SITE_SETTINGS}-${account.id}`;
  }

  /**
   * Flush site settings from the local storage and runtime cache.
   * @returns {Promise<void>}
   */
  async flush() {
    await browser.storage.local.remove(this.storageKey);
    delete SiteSettingsLocalStorage._runtimeCachedData[this.account.id];
    console.debug(`Site settings flushed for (${this.account.id})`);
  }

  /**
   * Get the site settings dto from local storage (or in-memory cache).
   * @returns {Promise<object|undefined>}
   */
  async get() {
    if (!SiteSettingsLocalStorage._runtimeCachedData[this.account.id]) {
      const data = await browser.storage.local.get([this.storageKey]);
      if (!data[this.storageKey]) {
        return;
      }
      SiteSettingsLocalStorage._runtimeCachedData[this.account.id] = data[this.storageKey];
    }
    return SiteSettingsLocalStorage._runtimeCachedData[this.account.id];
  }

  /**
   * Set the site settings in local storage.
   * @param {SiteSettingsEntity} settings
   * @returns {Promise<void>}
   * @throws {TypeError} If parameter settings is not of type SiteSettingsEntity.
   */
  async set(settings) {
    if (!settings || !(settings instanceof SiteSettingsEntity)) {
      throw new TypeError("Parameter `settings` should be of type SiteSettingsEntity.");
    }
    await navigator.locks.request(this.storageKey, async () => {
      const settingsDto = settings.toDto();
      await this._setBrowserStorage({ [this.storageKey]: settingsDto });
      SiteSettingsLocalStorage._runtimeCachedData[this.account.id] = settingsDto;
    });
  }

  /**
   * Update only the in-memory runtime cache, leaving browser.storage.local untouched.
   * Use when site settings are fetched in an unauthenticated context (e.g. login or setup
   * flows) so subsequent reads in the same session can skip the network without persisting
   * data into the per-account browser storage.
   * @param {SiteSettingsEntity} settings
   * @throws {TypeError} If parameter settings is not of type SiteSettingsEntity.
   */
  setRuntimeCache(settings) {
    if (!settings || !(settings instanceof SiteSettingsEntity)) {
      throw new TypeError("Parameter `settings` should be of type SiteSettingsEntity.");
    }
    SiteSettingsLocalStorage._runtimeCachedData[this.account.id] = settings.toDto();
  }

  /**
   * @param {object} data
   * @returns {Promise<void>}
   * @private
   */
  async _setBrowserStorage(data) {
    await browser.storage.local.set(data);
  }
}

export default SiteSettingsLocalStorage;
