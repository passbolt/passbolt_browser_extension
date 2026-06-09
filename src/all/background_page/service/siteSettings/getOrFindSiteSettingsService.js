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
import FindAndUpdateSiteSettingsLocalStorageService from "./findAndUpdateSiteSettingsLocalStorageService";
import SiteSettingsRuntimeCache from "./siteSettingsRuntimeCache";

/**
 * Read entry point for site settings. Successor of the legacy
 * 'OrganizationSettingsModel.getOrFind'.
 *
 * On 'refreshCache=true' (default), the cache step is skipped — every call goes through
 * to the API. Callers that explicitly opt into cached reads pass 'refreshCache=false',
 * which picks the cache by authentication state:
 *   - Authenticated: SiteSettingsLocalStorage (the offline-mode store), else the API.
 *   - Anonymous: SiteSettingsRuntimeCache (in-memory; populated by any fetch this
 *     session), else the API.
 *
 * The API fall-through goes through FindAndUpdateSiteSettingsLocalStorageService, which
 * refreshes the caches. Anonymous callers never read SiteSettingsLocalStorage.
 */
export default class GetOrFindSiteSettingsService {
  /**
   * @param {AccountEntity} account
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.siteSettingsLocalStorage = new SiteSettingsLocalStorage(account);
    this.findAndUpdateSiteSettingsLocalStorageService = new FindAndUpdateSiteSettingsLocalStorageService(
      account,
      apiClientOptions,
    );
  }

  /**
   * @param {boolean} [refreshCache=true] When true (default), bypass caches and hit the API.
   * Pass false to read from the cache selected by authentication state (LS when
   * authenticated, runtime cache when anonymous) before falling back to the API.
   * @returns {Promise<SiteSettingsEntity>}
   */
  async getOrFind(refreshCache = true) {
    if (!refreshCache) {
      const authStatus = await AuthStatusLocalStorage.get();
      const isAuthenticated = authStatus?.isAuthenticated === true;

      if (isAuthenticated) {
        const lsDto = await this.siteSettingsLocalStorage.get();
        if (lsDto) {
          return new SiteSettingsEntity(lsDto);
        }
      } else {
        const cachedDto = SiteSettingsRuntimeCache.get(this.account.id);
        if (cachedDto) {
          return new SiteSettingsEntity(cachedDto);
        }
      }
    }

    return this.findAndUpdateSiteSettingsLocalStorageService.findAndUpdateAll();
  }
}
