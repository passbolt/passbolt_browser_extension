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

import UserEntity from "../../model/entity/user/userEntity";
import AbstractLocalStorage from "./abstractLocalStorage";

const USER_ME_STORAGE_KEY_PREFIX = "user-me";

/**
 * A cache service used to store the result of the requests made on the users me entry point.
 */
class UserMeLocalStorage extends AbstractLocalStorage {
  /**
   * Get the key property
   * @return {string}
   */
  get key() {
    return USER_ME_STORAGE_KEY_PREFIX;
  }

  /**
   * Get the en
   * @return {BextUserEntity}
   */
  get entityClass() {
    return UserEntity;
  }

  /**
   * Get the contain options
   * @return {{profile: function(): {avatar: boolean}, role: boolean, gpgkey: boolean, groups_users: boolean, account_recovery_user_setting: boolean, pending_account_recovery_request: boolean}}
   * @constructor
   */
  static get DEFAULT_CONTAIN() {
    return UserEntity.ALL_CONTAIN_OPTIONS;
  }
}

export default UserMeLocalStorage;
