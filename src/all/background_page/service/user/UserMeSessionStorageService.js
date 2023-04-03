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
 * @since         4.0.0
 */

import browser from "../../sdk/polyfill/browserPolyfill";
import UserEntity from "../../model/entity/user/userEntity";

const USER_ME_STORAGE_KEY = "userMe";

/**
 * A cache service used to store the result of the requests made on the users me entry point.
 */
class UserMeSessionStorageService {
  /**
   * Get all the storage data.
   * @return {Object} A collection of users dto
   */
  static async get() {
    // @todo should use runtime memory too in order to reduce the access to the session storage.
    const storageData = await browser.storage.session.get(USER_ME_STORAGE_KEY);
    return storageData?.[USER_ME_STORAGE_KEY] || {};
  }

  static async getByAccount(account) {
    const collectionDto = await this.get();

    const userDto = collectionDto[account.domain]?.[account.user_id];
    if (userDto) {
      return new UserEntity(userDto);
    }

    return null;
  }

  static async setByAccount(account, user) {
    // @todo add lock.
    const collectionDto = await this.get();
    collectionDto[account.domain] = {
      ...collectionDto[account.domain],
      [account.id]: user.toDto(UserEntity.ALL_CONTAIN_OPTIONS)
    };
    await browser.storage.session.set({[USER_ME_STORAGE_KEY]: collectionDto});
  }
}

export default UserMeSessionStorageService;
