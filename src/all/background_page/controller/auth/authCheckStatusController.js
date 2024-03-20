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
   * @returns {Promise<void>}
   */
  async _exec() {
    try {
      const authStatus = await this.exec();
      this.worker.port.emit(this.requestId, 'SUCCESS', authStatus);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Controller executor.
   * @returns {Promise<{isAuthenticated: {bool}, isMfaRequired: {bool}}>}
   */
  async exec() {
    return await this.checkAuthStatusService.checkAuthStatus(true);
  }
}

export default AuthCheckStatusController;
