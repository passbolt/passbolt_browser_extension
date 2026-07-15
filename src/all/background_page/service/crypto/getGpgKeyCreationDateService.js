/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.6.3
 */
import GetOrFindSiteSettingsService from "../siteSettings/getOrFindSiteSettingsService";

class GetGpgKeyCreationDateService {
  /**
   * Returns a date that could be used to generate a gpg key
   * while being compatible with both the client and the server.
   *
   * @param {AccountEntity} account The account.
   * @param {ApiClientOptions} apiClientOptions The api client options.
   * @return {Promise<integer>}
   */
  static async getDate(account, apiClientOptions) {
    const getOrFindSiteSettingsService = new GetOrFindSiteSettingsService(account, apiClientOptions);

    let siteSettings;
    try {
      siteSettings = await getOrFindSiteSettingsService.getOrFind(false);
    } catch (e) {
      console.error(e);
      return new Date().getTime();
    }

    return siteSettings.isServerInPast() ? siteSettings.serverTime : new Date().getTime();
  }
}

export default GetGpgKeyCreationDateService;
