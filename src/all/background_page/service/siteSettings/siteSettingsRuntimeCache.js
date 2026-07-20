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

/**
 * Per-account in-memory cache of site settings DTOs. Successor of the legacy
 * `OrganizationSettingsModel._settings`. Service-worker lifetime.
 *
 * Auth-agnostic: written by FindAndUpdateSiteSettingsLocalStorageService after every API
 * fetch, and by GetOrFindSiteSettingsService when seeding from SiteSettingsLocalStorage
 * on the offline-auth read path. Read by GetOrFindSiteSettingsService.
 *
 * Independent of SiteSettingsLocalStorage. The two caches answer different questions:
 *   - SiteSettingsLocalStorage._runtimeCachedData mirrors browser.storage.local exactly
 *     and always reflects auth sitesettings value.
 *   - SiteSettingsRuntimeCache holds the most recent API result for this service-worker
 *     lifetime, regardless of whether it was persisted to browser.storage.local.
 * @private
 */
let _cache = {};

class SiteSettingsRuntimeCache {
  /**
   * Read the cached entry for the given account.
   * @returns {object|null} the cached DTO, or null when absent.
   */
  static get() {
    return _cache.siteSettings || null;
  }

  /**
   * Write the cached entry for the given account.
   * @param {SiteSettingsEntity} settings
   * @throws {TypeError} If settings is not a SiteSettingsEntity.
   */
  static set(settings) {
    if (!(settings instanceof SiteSettingsEntity)) {
      throw new TypeError("Parameter `settings` should be of type SiteSettingsEntity.");
    }
    _cache.siteSettings = settings.toDto();
  }

  /**
   * Drop the cached entry for an account. Intended for session lifecycle hooks
   * (logout / account switch).
   */
  static flush() {
    delete _cache.siteSettings;
  }

  /**
   * Drop every cached entry. Intended for tests.
   */
  static flushAll() {
    _cache = {};
  }
}

export default SiteSettingsRuntimeCache;
