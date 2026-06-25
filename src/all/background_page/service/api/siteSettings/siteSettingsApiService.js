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
import AbstractService from "../abstract/abstractService";

const SITE_SETTINGS_SERVICE_RESOURCE_NAME = "settings";

class SiteSettingsApiService extends AbstractService {
  /**
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, SiteSettingsApiService.RESOURCE_NAME);
  }

  static get RESOURCE_NAME() {
    return SITE_SETTINGS_SERVICE_RESOURCE_NAME;
  }

  /**
   * Fetch the site settings.
   * Merges the response server-time header into the dto as `serverTimeDiff` (ms).
   * @returns {Promise<object>} The site settings dto.
   */
  async findSiteSettings() {
    const response = await this.apiClient.findAll();
    const dto = JSON.parse(JSON.stringify(response.body));
    dto.serverTimeDiff = null;
    if (response.header?.servertime) {
      dto.serverTimeDiff = response.header.servertime * 1000 - new Date().getTime();
    }
    return dto;
  }
}

export default SiteSettingsApiService;
