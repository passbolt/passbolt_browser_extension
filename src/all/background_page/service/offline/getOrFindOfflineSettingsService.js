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
import OfflineSettingsEntity from "passbolt-styleguide/src/shared/models/entity/offline/offlineSettingsEntity";
import OfflineSettingsLocalStorage from "../local_storage/offlineSettingsLocalStorage";
import FindAndUpdateOfflineSettingsLocalStorageService from "./findAndUpdateOfflineSettingsLocalStorageService";
import GetOrFindActiveSessionService from "../activeSession/getOrFindActiveSessionService";

/**
 * The service aims to get offline settings from the local storage if it is set, or retrieve them from the API and
 * set the local storage.
 */
export default class GetOrFindOfflineSettingsService {
  /**
   * @constructor
   * @param {AccountEntity} account the account associated to the worker
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(account, apiClientOptions) {
    this.offlineSettingsLocalStorage = new OfflineSettingsLocalStorage(account);
    this.findAndUpdateOfflineSettingsLocalStorageService = new FindAndUpdateOfflineSettingsLocalStorageService(
      account,
      apiClientOptions,
    );
    this.getOrFindActiveSessionService = new GetOrFindActiveSessionService(account, apiClientOptions);
  }

  /**
   * Get the offline settings from the local storage, or retrieve them from the API and update the local storage.
   * @returns {Promise<OfflineSettingsEntity|null>}
   */
  async getOrFind() {
    const activeSession = await this.getOrFindActiveSessionService.getOrFind();
    // Only an online session with a server reachable refreshes stale data; an offline session cannot reach the API.
    const isStale =
      activeSession.isSessionOnline &&
      activeSession.isServerReachable &&
      (await this.offlineSettingsLocalStorage.isStaleSinceLastLoggedIn(activeSession.lastLoggedIn));
    if (!isStale) {
      const offlineSettingsDto = await this.offlineSettingsLocalStorage.getData();
      if (offlineSettingsDto) {
        return new OfflineSettingsEntity(offlineSettingsDto);
      } else if (activeSession.isSessionOffline) {
        return null;
      }
    }
    return this.findAndUpdateOfflineSettingsLocalStorageService.findAndUpdate();
  }
}
