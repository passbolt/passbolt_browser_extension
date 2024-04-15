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

import toolbarService from "../../controller/toolbarService";
import StartLoopAuthSessionCheckService from "./startLoopAuthSessionCheckService";
import InformCallToActionPagemod from "../../pagemod/informCallToActionPagemod";
import WorkerService from "../worker/workerService";

class PostLoginService {
  /**
   * Post login
   * @returns {Promise<void>}
   */
  static async exec() {
    await PostLoginService.sendLoginEventForWorkers();
    await StartLoopAuthSessionCheckService.exec();
    toolbarService.handleUserLoggedIn();
  }

  /**
   * Send login event on workers
   * @return {Promise<void>}
   */
  static async sendLoginEventForWorkers() {
    await WorkerService.emitOnWorkersWithName('passbolt.auth.after-login', [InformCallToActionPagemod.appName]);
  }
}

export default PostLoginService;
