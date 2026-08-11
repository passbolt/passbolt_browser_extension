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
 * @since         5.12.1
 */
import AutofillSettingsService from "../service/autofill/autofillSettingsService";

/**
 * Listens the autofill settings events.
 *
 * Read-only: the popup reads the `autofillOnLaunch` preference to decide the launch behaviour.
 * Writing is done exclusively from the extension options page, which uses `chrome.storage.local`
 * directly, so no setter is exposed over the port (smaller attack surface).
 * @param {Worker} worker
 */
const listen = function (worker) {
  /*
   * Get the autofill on launch settings.
   *
   * @listens passbolt.autofill-settings.get
   * @param requestId {uuid} The request identifier
   */
  worker.port.on("passbolt.autofill-settings.get", async (requestId) => {
    try {
      const settings = await AutofillSettingsService.get();
      worker.port.emit(requestId, "SUCCESS", settings);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, "ERROR", new Error("Could not read the autofill settings."));
    }
  });
};

export const AutofillSettingsEvents = { listen };
