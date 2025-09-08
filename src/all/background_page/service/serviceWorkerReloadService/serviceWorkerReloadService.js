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
 * @since         5.5.0
 */

import publicWebsiteSignInPagemod from "../../pagemod/publicWebsiteSignInPagemod";
import webIntegrationPagemod from "../../pagemod/webIntegrationPagemod";
import BrowserExtensionUpdatedLocalStorage from "../local_storage/browserExtensionUpdatedLocalStorage";
import WorkerService from "../worker/workerService";

export const PASSBOLT_EXTENSION_UPDATED_LOCAL_STORAGE_KEY = "passboltExtensionUpdated";

const TIME_THRESHOLD_IN_MS = 10_000;

export default class ServiceWorkerReloadService {
  /**
   * Triggers a service worker reload when necessary.
   * The "necessity" is checked through data set in the local storage.
   * @returns {Promise<void>}
   */
  static async reloadIfNecessary() {
    const storage = new BrowserExtensionUpdatedLocalStorage();
    const lastUpdateTimestamp = await storage.get();

    if (!lastUpdateTimestamp) {
      return;
    }

    const lastUpdateTime = new Date(parseInt(lastUpdateTimestamp, 10));
    const now = new Date();

    const isReloadNecessary = (now - lastUpdateTime) < TIME_THRESHOLD_IN_MS;
    if (!isReloadNecessary) {
      return;
    }

    await storage.flush();

    await WorkerService.destroyWorkersByName([webIntegrationPagemod.appName, publicWebsiteSignInPagemod.appName]);
    await browser.runtime.reload();
  }
}
