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
import UserApiService from "passbolt-styleguide/src/shared/services/api/user/userApiService";
import UserMeLocalStorage from "../local_storage/userMeLocalStorage";
import UserEntity from "../../model/entity/user/userEntity";
import GetOrFindSiteSettingsService from "../siteSettings/getOrFindSiteSettingsService";
import GetOrFindActiveSessionService from "../activeSession/getOrFindActiveSessionService";

/**
 * The service aims to get user me from the local storage if it is set, or retrieve them from the API and
 * set the local storage.
 */
class GetOrFindMeService {
  /**
   * Constructor.
   * @param {AccountEntity} account The user account.
   * @param {ApiClientOptions} apiClientOptions The api client options.
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.userApiService = new UserApiService(apiClientOptions);
    this.getOrFindSiteSettingsService = new GetOrFindSiteSettingsService(account, apiClientOptions);
    this.userMeLocalStorageService = new UserMeLocalStorage(account);
    this.getOrFindActiveSessionService = new GetOrFindActiveSessionService(account, apiClientOptions);
  }

  /**
   * Get or find me as a user.
   * @param {boolean} refreshCache (Optional) Should request the API and refresh the cache. Default false.
   * @returns {Promise<UserEntity|null>}
   */
  async getOrFindMe(refreshCache = false) {
    if (!refreshCache) {
      const activeSession = await this.getOrFindActiveSessionService.getOrFind();
      // Only an online session with a server reachable refreshes stale data; an offline session cannot reach the API.
      const isStale =
        activeSession.isSessionOnline &&
        activeSession.isServerReachable &&
        (await this.userMeLocalStorageService.isStaleSinceLastLoggedIn(activeSession.lastLoggedIn));
      if (!isStale) {
        const userDto = await this.userMeLocalStorageService.getData();
        if (typeof userDto !== "undefined") {
          return new UserEntity(userDto);
        } else if (activeSession.isSessionOffline) {
          return null;
        }
      }
    }

    const contains = { profile: true, role: true, account_recovery_user_setting: true };
    const siteSettings = await this.getOrFindSiteSettingsService.getOrFind();
    if (siteSettings.isPluginEnabled("metadata")) {
      contains.missing_metadata_key_ids = true;
    }

    const userDto = await this.userApiService.get(this.account.userId, contains);
    const userEntity = new UserEntity(userDto, { ignoreInvalidEntity: true });

    await this.userMeLocalStorageService.setData(userEntity);

    return userEntity;
  }
}

export default GetOrFindMeService;
