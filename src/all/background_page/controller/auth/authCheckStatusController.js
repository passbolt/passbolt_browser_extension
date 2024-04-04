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

class AuthCheckStatusController {
  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
    this.checkAuthStatusService = new CheckAuthStatusService();
  }

  /**
   * Controller executor.
   * @param {boolean} [flushCache = true] should the cache be flushed before
   * @returns {Promise<void>}
   */
  async _exec(flushCache = true) {
    try {
      const authStatus = await this.exec(flushCache);
      this.worker.port.emit(this.requestId, 'SUCCESS', authStatus);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Controller executor.
   * @param {boolean} flushCache should the cache be flushed before
   * @returns {Promise<{isAuthenticated: {bool}, isMfaRequired: {bool}}>}
   */
  async exec(flushCache) {
    return await this.checkAuthStatusService.checkAuthStatus(flushCache);
  }
}

export default AuthCheckStatusController;
