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
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import SiteSettingsApiService from "../api/siteSettings/siteSettingsApiService";

class FindSiteSettingsService {
  /**
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(apiClientOptions) {
    this.siteSettingsApiService = new SiteSettingsApiService(apiClientOptions);
  }

  /**
   * Fetch the site settings from the API and return them as a SiteSettingsEntity.
   * On the cloud, a disabled organization returns 403 — that case is normalized to a
   * disabled site-settings entity to preserve historical behavior.
   * @returns {Promise<SiteSettingsEntity>}
   */
  async findSiteSettings() {
    let dto;
    try {
      dto = await this.siteSettingsApiService.findSiteSettings();
    } catch (error) {
      if (error instanceof PassboltApiFetchError && error?.data?.code === 403) {
        dto = SiteSettingsEntity.disabledSiteSettings;
      } else {
        throw error;
      }
    }
    return new SiteSettingsEntity(dto);
  }
}

export default FindSiteSettingsService;
