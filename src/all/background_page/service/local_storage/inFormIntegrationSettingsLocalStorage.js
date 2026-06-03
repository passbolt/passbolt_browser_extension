/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2024 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2024 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         5.7.0
 */
import Log from "../../model/log";
import InFormIntegrationSettingsEntity from "../../model/entity/inFormIntegration/inFormIntegrationSettingsEntity";

export const IN_FORM_INTEGRATION_SETTINGS_LOCAL_STORAGE_KEY = "inFormIntegrationSettings";

/**
 * Local (per-account) storage for the user's in-form integration preferences.
 */
class InFormIntegrationSettingsLocalStorage {
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
      throw new Error("Cannot retrieve account id, necessary to get an inFormIntegrationSettings storage key.");
    }
    return `${IN_FORM_INTEGRATION_SETTINGS_LOCAL_STORAGE_KEY}-${account.id}`;
  }

  /**
   * Flush the inFormIntegrationSettings local storage
   * @return {Promise<void>}
   */
  async flush() {
    Log.write({ level: "debug", message: "InFormIntegrationSettingsLocalStorage flushed" });
    await browser.storage.local.remove(this.storageKey);
  }

  /**
   * Get the InFormIntegrationSettings local storage.
   * @return {Promise<InFormIntegrationSettingsEntity|null>} the settings entity or null when nothing valid is stored.
   */
  async get() {
    const value = await browser.storage.local.get([this.storageKey]);
    if (!value || !value[this.storageKey]) {
      return null;
    }

    // ensure this feature is not breaking anything by returning an accepted default value
    try {
      return new InFormIntegrationSettingsEntity(value[this.storageKey]);
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  /**
   * Set the inFormIntegrationSettings in local storage.
   * @param {InFormIntegrationSettingsEntity} inFormIntegrationSettingsEntity the value to save.
   * @return {Promise<void>}
   */
  async set(inFormIntegrationSettingsEntity) {
    await navigator.locks.request(this.storageKey, async () => {
      await browser.storage.local.set({ [this.storageKey]: inFormIntegrationSettingsEntity.toDto() });
    });
  }
}

export default InFormIntegrationSettingsLocalStorage;
