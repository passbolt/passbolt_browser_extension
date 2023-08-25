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
 * @since         4.1.0
 */

import browser from "../../sdk/polyfill/browserPolyfill";
import UserEntity from "../../model/entity/user/userEntity";

const USER_ME_STORAGE_KEY_PREFIX = "user-me";

/**
 * A cache service used to store the result of the requests made on the users me entry point.
 */
class UserMeSessionStorageService {
  /**
   * Get the storage key.
   * @param {AbstractAccountEntity} account The account to get the key for.
   * @returns {string}
   * @throws {Error} If it cannot retrieve account id.
   */
  static getStorageKey(account) {
    if (!account.id) {
      throw new Error('Cannot retrieve account id, necessary to get a users me storage key.');
    }
    return `${USER_ME_STORAGE_KEY_PREFIX}-${account.id}`;
  }

  /**
   * Get a user me cached data for a given account.
   * @param {AbstractAccountEntity} account The account to get the cached data for.
   * @returns {Promise<UserEntity|null>} Return the user me cached entity or null if the cache was not initialized.
   * Note that in case the cache would be invalid, it would return null as well.
   * @throws {Error} If it cannot get the storage key.
   */
  static async get(account) {
    const storageKey = this.getStorageKey(account);
    let storageData;

    try {
      storageData = await browser.storage.session.get(storageKey);
    } catch (error) {
      throw new Error('Unable to access the user me session storage', {cause: error});
    }

    const userMeDto = storageData?.[storageKey];

    if (userMeDto) {
      try {
        return new UserEntity(userMeDto);
      } catch (error) {
        console.debug('Unable to instantiate the user entity based on the cached user dto.', error);
      }
    }

    return null;
  }

  /**
   * Cache a user me data for a given account.
   * @param {AbstractAccountEntity} account The account to get the cached data for.
   * @param {UserEntity} user The user me to cache
   * @returns {Promise<void>}
   */
  static async set(account, user) {
    const storageKey = this.getStorageKey(account);

    await navigator.locks.request(storageKey, async() => {
      await browser.storage.session.set({[storageKey]: user.toDto(UserEntity.ALL_CONTAIN_OPTIONS)});
    });
  }

  /**
   * Remove the cached data for a given account.
   * @param {AbstractAccountEntity} account The account to get the cached data for.
   * @returns {Promise<void>}
   */
  static async remove(account) {
    const storageKey = this.getStorageKey(account);

    await navigator.locks.request(storageKey, async() => {
      await browser.storage.session.remove(storageKey);
    });
  }
}

export default UserMeSessionStorageService;
