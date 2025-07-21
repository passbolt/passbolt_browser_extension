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
import AppPagemod from "../../pagemod/appPagemod";
import LocalStorageService from "../localStorage/localStorageService";
import toolbarService from "../toolbar/toolbarService";
import StartLoopAuthSessionCheckService from "./startLoopAuthSessionCheckService";
import resourceInProgressCacheService from "../cache/resourceInProgressCache.service";
import OnExtensionUpdateAvailableService from "../extension/onExtensionUpdateAvailableService";
import InformCallToActionPagemod from "../../pagemod/informCallToActionPagemod";
import WorkerService from "../worker/workerService";
import CopyToClipboardService from "../clipboard/copyToClipboardService";
class PostLogoutService {
  /**
   * Execute all processes after a logout
   * Sends a passbolt.auth.after-logout event on workers
   */
  static async exec() {
    await PostLogoutService.sendLogoutEventForWorkers();
    await LocalStorageService.flush();
    await (new CopyToClipboardService()).flushTemporaryContentIfAny();
    await StartLoopAuthSessionCheckService.clearAlarm();
    toolbarService.handleUserLoggedOut();
    resourceInProgressCacheService.reset();
    OnExtensionUpdateAvailableService.handleUserLoggedOut();
  }

  /**
   * Send logout event on workers
   * @return {Promise<void>}
   */
  static async sendLogoutEventForWorkers() {
    await WorkerService.emitOnWorkersWithName('passbolt.auth.after-logout', [AppPagemod.appName, InformCallToActionPagemod.appName]);
  }
}

export default PostLogoutService;
