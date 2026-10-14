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
import GetOrFindOfflineSettingsService from "./getOrFindOfflineSettingsService";
import GetOrFindSiteSettingsService from "../siteSettings/getOrFindSiteSettingsService";
import GetOrFindMeService from "../user/getOrFindMeService";
import GetOrFindRbacService from "../rbac/getOrFindRbacService";
import { actions } from "passbolt-styleguide/src/shared/services/rbacs/actionEnumeration";
import RbacsCollection from "passbolt-styleguide/src/shared/models/entity/rbac/rbacsCollection";
import SiteSettingsEntity from "passbolt-styleguide/src/shared/models/entity/siteSettings/siteSettingsEntity";
import OfflineSettingsLocalStorage from "../local_storage/offlineSettingsLocalStorage";
import SiteSettingsLocalStorage from "../local_storage/siteSettingsLocalStorage";
import UserMeLocalStorage from "../local_storage/userMeLocalStorage";
import RbacsLocalStorage from "../local_storage/rbacLocalStorage";
import UserEntity from "../../model/entity/user/userEntity";
import CanUse from "passbolt-styleguide/src/shared/services/rbacs/canUseService";
import SiteSettingsRuntimeCache from "../siteSettings/siteSettingsRuntimeCache";

/**
 * Returns whether the current user can use offline storage for resources.
 *
 * The check combines the following gates:
 *  - The offline mode plugin is enabled on the API. Checked first, as the offline settings local storage
 *    only reflects a plugin disable at the next successful sync.
 *  - The org has offline mode configured. Offline settings presence is the signal for this: the org
 *    settings row exists.
 *    (see FindAndUpdateOfflineSettingsLocalStorageService, which flushes it when the API returns nothing),
 *    so its presence means "offline mode was configured as of the last sync".
 *    The org settings are handed to any authenticated user; they do NOT encode per-user access.
 *  - The current user is granted access to view offline items (OFFLINE_ITEMS_VIEW). This is the per-user
 *    gate and is what the server actually enforces on the offline items themselves.
 *
 * Two entry points resolve the same gates from different sources:
 *  - {@link canUseOfflineStorage} for the online journeys: it reads through the caches and refreshes them
 *    from the API when they are stale.
 *  - {@link canUseOfflineStorageFromLocalStorage} for the storage teardown journeys: local reads only, no
 *    network and no cache write-back.
 */
export default class CanUseOfflineStorageService {
  /**
   * @constructor
   * @param {AccountEntity} account The current user account.
   * @param {ApiClientOptions} apiClientOptions The api client options.
   */
  constructor(account, apiClientOptions) {
    this.getOrFindOfflineSettingsService = new GetOrFindOfflineSettingsService(account, apiClientOptions);
    this.getOrFindSiteSettingsService = new GetOrFindSiteSettingsService(account, apiClientOptions);
    this.getOrFindMeService = new GetOrFindMeService(account, apiClientOptions);
    this.getOrFindRbacService = new GetOrFindRbacService(apiClientOptions, account);
  }

  /**
   * Returns true if the offline mode plugin is enabled, offline mode is configured for the org and the
   * current user can access offline data.
   * Return false if any error happen (prevent any online workflow to failed)
   * @returns {Promise<boolean>}
   */
  async canUseOfflineStorage() {
    try {
      // Offline mode plugin is enabled on the API.
      const siteSettings = await this.getOrFindSiteSettingsService.getOrFind();
      if (!siteSettings?.isPluginEnabled("offlineMode")) {
        return false;
      }
      // Org has offline mode configured.
      const offlineSettings = await this.getOrFindOfflineSettingsService.getOrFind();
      if (!offlineSettings) {
        return false;
      }
      const user = await this.getOrFindMeService.getOrFindMe();
      if (!user) {
        return false;
      }
      /*
       * Administrators are not controlled by rbac (see canViewOfflineItems), so their rbacs are not
       * retrieved: it would trigger a useless API round-trip on a stale or empty cache.
       */
      const rbacs = user?.role?.isAdmin() ? null : await this.getOrFindRbacService.getOrFindMe();
      return CanUse.canRoleUseAction(user, rbacs, actions.OFFLINE_ITEMS_VIEW);
    } catch (error) {
      console.error("Could not resolve the offline capability.", error);
      return false;
    }
  }

  /**
   * Returns true if the offline mode plugin is enabled, offline mode is configured for the org and the
   * current user can access offline data, resolved from the local storages only: no API call, and no cache
   * write-back.
   *
   * Meant for the journeys that cannot afford the storage teardown on logout and on
   * browser startup: the caches are being removed (a read-through service would re-create the very storages
   * the teardown is flushing, and each of them resolves the active session, itself a flushed storage), and
   * the server is unreachable on the offline paths, where there is no session left to authenticate an API
   * call with.
   *
   * Missing data is treated as "cannot use offline storage": without the site settings, the user or its
   * rbacs the gates cannot be resolved, and there is then nothing worth retaining. The storages read here
   * are written on any authenticated site settings / offline settings refresh, so they are populated
   * whenever offline mode was usable during the session being torn down.
   *
   * @param {AccountEntity} account The current user account.
   * @returns {Promise<boolean>}
   * @throws {EntityValidationError} If a stored dto does not validate.
   */
  static async canUseOfflineStorageFromLocalStorage(account) {
    const siteSettingsDto = await new SiteSettingsLocalStorage(account).get();
    if (!siteSettingsDto) {
      return false;
    } else {
      const siteSettings = new SiteSettingsEntity(siteSettingsDto);
      if (!siteSettings?.isPluginEnabled("offlineMode")) {
        return false;
      }
      /*
       * Mirror the persisted settings into the in-memory runtime cache. The cache is
       * service-worker-lifetime and is flushed on login (postLoginService) and lost on
       * service-worker restart, whereas SiteSettingsLocalStorage survives both. Seeding it
       * here keeps AppEmailValidatorService.validate - which reads SiteSettingsRuntimeCache
       * synchronously to validate account usernames - in sync with the persisted settings,
       * so a custom email validation regex is honored even after the cache has been dropped.
       */
      SiteSettingsRuntimeCache.set(siteSettings);
    }

    const offlineSettingsDto = await new OfflineSettingsLocalStorage(account).getData();
    if (!offlineSettingsDto) {
      return false;
    }

    const userDto = await new UserMeLocalStorage(account).getData();
    if (!userDto) {
      return false;
    }
    const user = new UserEntity(userDto);

    const rbacsDto = await new RbacsLocalStorage(account).getData();
    // user with no rbac
    if (!user?.role.isAdmin() && !rbacsDto) {
      return false;
    }

    return CanUse.canRoleUseAction(
      user,
      rbacsDto ? new RbacsCollection(rbacsDto) : new RbacsCollection([]),
      actions.OFFLINE_ITEMS_VIEW,
    );
  }
}
