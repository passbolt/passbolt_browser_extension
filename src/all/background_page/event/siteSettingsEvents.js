/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SARL (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.2.0
 */
import GetOrFindSiteSettingsController from "../controller/siteSettings/getOrFindSiteSettingsController";

const listen = function (worker, apiClientOptions, account) {
  /*
   * Return cached site settings or fetch from the API. Same `refreshCache` semantics as the
   * legacy `passbolt.organization-settings.get` event.
   * @listens passbolt.site-settings.get-or-find
   * @param {string} requestId
   * @param {boolean} [refreshCache=true]
   */
  worker.port.on("passbolt.site-settings.get-or-find", async (requestId, refreshCache = true) => {
    const controller = new GetOrFindSiteSettingsController(worker, requestId, apiClientOptions, account);
    await controller._exec(refreshCache);
  });
};
export const SiteSettingsEvents = { listen };
