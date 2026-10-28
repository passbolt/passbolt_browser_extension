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
 */
import FindThemesController from "../controller/theme/findThemesController";
import UpdateThemeController from "../controller/theme/updateThemeController";

/**
 * Listens the theme events
 * @param {Worker} worker
 * @param {ApiClientOptions} apiClientOptions the api client options
 */
const listen = function (worker, apiClientOptions) {
  /**
   * Find all themes
   *
   * @listens passbolt.themes.find-all
   * @param requestId {uuid} The request identifier
   */
  worker.port.on("passbolt.themes.find-all", async (requestId) => {
    const controller = new FindThemesController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  /**
   * Change the current user theme
   *
   * @listens passbolt.themes.change
   * @param requestId {uuid} The request identifier
   * @param name {string} The theme name
   */
  worker.port.on("passbolt.themes.change", async (requestId, name) => {
    const controller = new UpdateThemeController(worker, requestId, apiClientOptions);
    await controller._exec(name);
  });
};

export const ThemeEvents = { listen };
