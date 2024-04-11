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
import toolbarController from "../../controller/toolbarController";
import AuthenticationEventController from "../../controller/auth/authenticationEventController";

class PostLogoutService {
  /**
   * Execute all processes after a logout
   */
  static async exec() {
    const workers = await WorkersSessionStorage.getWorkersByNames([AppPagemod.appName, WebIntegrationPagemod.appName]);
    PostLogoutService.sendLogoutEventForWorkerDisconnected(workers);
    LocalStorageService.flush();
    toolbarController.handleUserLoggedOut();
    AuthenticationEventController.handleUserLoggedOut();

    //@todo remove the dispatch event once every 'after-logout' listeners are handled here
    const event = new Event('passbolt.auth.after-logout');
    self.dispatchEvent(event);
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
