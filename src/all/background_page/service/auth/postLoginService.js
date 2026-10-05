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

import toolbarService from "../toolbar/toolbarService";
import StartLoopAuthSessionCheckService from "./startLoopAuthSessionCheckService";
import InformCallToActionPagemod from "../../pagemod/informCallToActionPagemod";
import WorkerService from "../worker/workerService";
import SiteSettingsRuntimeCache from "../siteSettings/siteSettingsRuntimeCache";
import FindAndUpdateActiveSessionLocalStorageService from "../activeSession/findAndUpdateActiveSessionLocalStorageService";

class PostLoginService {
  /**
   * Post login
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   * @returns {Promise<void>}
   */
  static async exec(account, apiClientOptions) {
    // Clear the in-memory site settings cache so the next authenticated read refetches.
    SiteSettingsRuntimeCache.flushAll();
    // Record the online login transition (is_authenticated + login date) on the active session.
    const findAndUpdateActiveSessionLocalStorageService = new FindAndUpdateActiveSessionLocalStorageService(
      account,
      apiClientOptions,
    );
    await findAndUpdateActiveSessionLocalStorageService.authenticateOnline();
    // Start the session check first, so it never depends on the workers' ability to answer.
    await StartLoopAuthSessionCheckService.exec();
    await PostLoginService.sendLoginEventForWorkers();
    toolbarService.handleUserLoggedIn();
  }

  /**
   * Send login event on workers
   * @return {Promise<void>}
   */
  static async sendLoginEventForWorkers() {
    await WorkerService.emitOnWorkersWithName("passbolt.auth.after-login", [InformCallToActionPagemod.appName]);
  }
}

export default PostLoginService;
