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
import SiteSettingsLocalStorage from "../local_storage/siteSettingsLocalStorage";
import AuthStatusLocalStorage from "../local_storage/authStatusLocalStorage";
import FindSiteSettingsService from "./findSiteSettingsService";
import SiteSettingsRuntimeCache from "./siteSettingsRuntimeCache";

const FIND_AND_UPDATE_SITE_SETTINGS_LS_LOCK_PREFIX = "FIND_AND_UPDATE_SITE_SETTINGS_LS_LOCK-";

/**
 * Fetches site settings from the API. Always updates the in-memory SiteSettingsRuntimeCache.
 * For authenticated sessions, also writes to SiteSettingsLocalStorage (the offline-mode
 * store). Unauthenticated sessions never touch SiteSettingsLocalStorage.
 *
 * Concurrent calls coalesce via navigator.locks — only the first hits the API, the rest
 * wait and return what the leader wrote to SiteSettingsRuntimeCache.
 */
export default class FindAndUpdateSiteSettingsLocalStorageService {
  /**
   * @param {AccountEntity} account
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.findSiteSettingsService = new FindSiteSettingsService(apiClientOptions);
    this.siteSettingsLocalStorage = new SiteSettingsLocalStorage(account);
  }

  /**
   * @returns {Promise<SiteSettingsEntity|null>} the leader returns the freshly fetched
   * entity; coalesced waiters return the entity from SiteSettingsRuntimeCache (or null
   * if the leader failed before writing).
   */
  async findAndUpdateAll() {
    const lockKey = `${FIND_AND_UPDATE_SITE_SETTINGS_LS_LOCK_PREFIX}${this.account.id}`;

    return await navigator.locks.request(lockKey, { ifAvailable: true }, async (lock) => {
      // Another caller is already refreshing: wait on a shared lock and return what they wrote.
      if (!lock) {
        return await navigator.locks.request(lockKey, { mode: "shared" }, async () => {
          const dto = SiteSettingsRuntimeCache.get(this.account.id);
          return dto ? new SiteSettingsEntity(dto) : null;
        });
      }

      const siteSettings = await this.findSiteSettingsService.findSiteSettings();

      // Authenticated sessions persist to SiteSettingsLocalStorage (the offline-mode store);
      // Anonymous sessions only get the in-memory runtime cache below.
      const authStatus = await AuthStatusLocalStorage.get();
      const isAuthenticated = authStatus?.isAuthenticated === true;

      if (isAuthenticated) {
        await this.siteSettingsLocalStorage.set(siteSettings);
      }

      SiteSettingsRuntimeCache.set(this.account.id, siteSettings);

      return siteSettings;
    });
  }
}
