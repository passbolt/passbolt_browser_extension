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
 * @since         4.5.0
 */
import PasswordExpirySettingsModel from "../../model/passwordExpiry/passwordExpirySettingsModel";

export const PASSWORD_EXPIRY_SETTINGS_LOCK = 'passwordExpirySettingsLock';
/**
 * The passwordExpirySettingsGetOrFindService perform a get or update the password expiry settings local storage
 */
class PasswordExpirySettingsGetOrFindService {
  constructor(account, apiClientOptions) {
    this.storageKey = this.getStorageKey(account);
    this.passwordExpirySettingsModel = new PasswordExpirySettingsModel(account, apiClientOptions);
  }

  /**
   * Get the storage key.
   * @param {AbstractAccountEntity} account The account to get the key for.
   * @returns {string}
   * @throws {Error} If it cannot retrieve account id.
   */
  getStorageKey(account) {
    if (!account.id) {
      throw new Error('Cannot retrieve account id, necessary to lock the password expiry settings get or find service.');
    }
    return `${PASSWORD_EXPIRY_SETTINGS_LOCK}-${account.id}`;
  }

  /**
   * Get or find the password expiry settings in local storage.
   * @param {boolean} refreshCache
   * @return {Promise<PasswordExpirySettingsEntity>}
   */
  async exec(refreshCache = false) {
    return await navigator.locks.request(this.storageKey, async() => await this.passwordExpirySettingsModel.getOrFindOrDefault(refreshCache));
  }
}

export default PasswordExpirySettingsGetOrFindService;
