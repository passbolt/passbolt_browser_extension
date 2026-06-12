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
 * @since         5.13.0
 */
import RoleEntity from "passbolt-styleguide/src/shared/models/entity/role/roleEntity";
import UsersCollection from "passbolt-styleguide/src/shared/models/entity/user/usersCollection";
import OrganizationSettingsModel from "../../model/organizationSettings/organizationSettingsModel";
import UserLocalStorage from "../local_storage/userLocalStorage";
import FindUsersService from "./findUsersService";

const USERS_UPDATE_ALL_LS_LOCK_PREFIX = "USERS_UPDATE_LS_LOCK_";

/**
 * The service aim to find and update the users local storage service.
 */
class FindAndUpdateUsersLocalStorageService {
  /**
   * Constructor.
   * @param {AccountEntity} account The user account.
   * @param {ApiClientOptions} apiClientOptions The api client options.
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.findUsersService = new FindUsersService(account, apiClientOptions);
    this.organisationSettingsModel = new OrganizationSettingsModel(apiClientOptions);
    this.lockKey = `${USERS_UPDATE_ALL_LS_LOCK_PREFIX}-${this.account.id}`;
  }

  /**
   * Update the users local storage with the latest API data. Concurrent calls are serialised through
   * navigator.locks; subsequent callers wait for the in-flight update and read from local storage
   * afterwards.
   * @returns {Promise<UsersCollection>}
   * @public
   */
  async findAndUpdateAll() {
    return await navigator.locks.request(this.lockKey, { ifAvailable: true }, async (lock) => {
      // Lock not granted, an update is already in progress. Wait for its completion to notify the function consumer.
      if (!lock) {
        return await navigator.locks.request(this.lockKey, { mode: "shared" }, async () => {
          // Return the data from local storage while waiting for the update in progress.
          const usersDto = await UserLocalStorage.get();
          return new UsersCollection(usersDto);
        });
      }

      // contain pending_account_recovery_request is only available for admin or recovery contact role
      const contains = {
        profile: true,
        gpgkey: false,
        groups_users: false,
        last_logged_in: true,
        pending_account_recovery_request: true,
        account_recovery_user_setting: true,
      };
      if (this.account?.roleName === RoleEntity.ROLE_ADMIN) {
        contains.is_mfa_enabled = true;
        const organizationSettings = await this.organisationSettingsModel.getOrFind();
        if (organizationSettings.isPluginEnabled("metadata")) {
          contains.missing_metadata_key_ids = true;
        }
      }

      const usersCollection = await this.findUsersService.findAll(contains, {}, true);
      await UserLocalStorage.set(usersCollection);

      return usersCollection;
    });
  }
}

export default FindAndUpdateUsersLocalStorageService;
