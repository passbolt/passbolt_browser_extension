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

import AuthenticationEventController from "../../controller/auth/authenticationEventController";
import toolbarController from "../../controller/toolbarController";
import StartLoopAuthSessionCheckService from "./startLoopAuthSessionCheckService";
class PostLoginService {
  /**
   * Post login
   * @returns {Promise<void>}
   */
  static async postLogin() {
    await StartLoopAuthSessionCheckService.exec();
    toolbarController.handleUserLoggedIn();
    AuthenticationEventController.handleUserLoggedIn();

    //@todo remove the dispatch event once every 'after-login' listeners are handled here
    const event = new Event('passbolt.auth.after-login');
    self.dispatchEvent(event);
  }
}

export default PostLoginService;
