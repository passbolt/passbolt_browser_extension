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
 * @since         2.11.0
 */
import CheckAuthStatusService from "../../service/auth/checkAuthStatusService";

class AuthIsAuthenticatedController {
  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
    this.checkAuthStatusService = new CheckAuthStatusService();
  }

  /**
   * Execute the controller.
   * @param {boolean} flushCache should the auth status cache be flushed before or not.
   * @returns {Promise<void>}
   */
  async _exec(flushCache) {
    try {
      const isAuthenticated = await this.exec(flushCache);
      this.worker.port.emitQuiet(this.requestId, 'SUCCESS', isAuthenticated);
    } catch (error) {
      this.worker.port.emitQuiet(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Returns true if the current user is authenticated (regardless of the MFA status)
   * @param {boolean} flushCache should the auth status cache be flushed before or not.
   * @returns {Promise<boolean>}
   */
  async exec(flushCache) {
    const authStatus = await this.checkAuthStatusService.checkAuthStatus(flushCache);
    return authStatus.isAuthenticated;
  }
}

export default AuthIsAuthenticatedController;
