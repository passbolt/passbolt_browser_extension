import browser from "webextension-polyfill";
import PortManager from "../../../../chrome-mv3/sdk/portManager";
import {Worker} from "../../model/worker";
import WorkersSessionStorage from "../../../../chrome-mv3/service/sessionStorage/workersSessionStorage";
import BrowserTabService from "../ui/browserTab.service";

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
 * @since         4.0.0
 */

class WorkerService {
  /**
   *
   * Get the worker according to the application name and tab id
   *
   * @param {string} applicationName The application name
   * @param {number} tabId The tab id
   * @returns {Promise<Worker>} The worker
   */
  static async get(applicationName, tabId) {
    // @deprecated The support of MV2 will be down soon
    if (this.isManifestV2) {
      return Worker.get(applicationName, tabId);
    }
    // MV3 process
    const workers = await WorkersSessionStorage.getWorkersByNameAndTabId(applicationName, tabId);
    if (workers.length === 0) {
      throw new Error(`Could not find worker ${applicationName} for tab ${tabId}.`);
    }
    // Get only the first worker
    const worker = workers[0];
    if (!PortManager.isPortExist(worker.id)) {
      await BrowserTabService.sendMessage(worker, "passbolt.port.connect", worker.id);
    }
    const port = await PortManager.getPortById(worker.id);
    const tab = port._port.sender.tab;
    return {port, tab};
  }

  /**
   * Is manifest v2
   * @returns {boolean}
   * @private
   */
  static get isManifestV2() {
    return browser.runtime.getManifest().manifest_version === 2;
  }
}

export default WorkerService;
