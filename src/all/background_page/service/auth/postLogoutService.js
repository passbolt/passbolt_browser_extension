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
 * @since         4.7.0
 */
import WorkersSessionStorage from "../sessionStorage/workersSessionStorage";
import AppPagemod from "../../pagemod/appPagemod";
import WebIntegrationPagemod from "../../pagemod/webIntegrationPagemod";
import PortManager from "../../sdk/port/portManager";
import LocalStorageService from "../localStorage/localStorageService";
import BrowserTabService from "../ui/browserTab.service";

class PostLogoutService {
  /**
   * Execute all processes after a logout
   */
  static async exec() {
    const workers = await WorkersSessionStorage.getWorkersByNames([AppPagemod.appName, WebIntegrationPagemod.appName]);
    PostLogoutService.sendLogoutEventForWorkerDisconnected(workers);
    LocalStorageService.flush();
  }

  /**
   * Send logout event on workers disconnected port
   * @param workers
   * @return {Promise<void>}
   */
  static async sendLogoutEventForWorkerDisconnected(workers) {
    for (const worker of workers) {
      if (!PortManager.isPortExist(worker.id)) {
        await BrowserTabService.sendMessage(worker, "passbolt.port.connect", worker.id);
        const port = PortManager.getPortById(worker.id);
        port.emit('passbolt.auth.after-logout');
      }
    }
  }
}

export default PostLogoutService;
