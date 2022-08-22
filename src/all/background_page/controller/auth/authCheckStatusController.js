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
import GpgAuth from "../../model/gpgauth";

class AuthCheckStatusController {
  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
    this.auth = new GpgAuth();
  }

  async main() {
    try {
      const status = await this.auth.checkAuthStatus();
      this.worker.port.emit(this.requestId, 'SUCCESS', status);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }
}

export default AuthCheckStatusController;
