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
const GpgAuth = require('../../model/gpgauth').GpgAuth;

class AuthIsAuthenticatedController {

  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
    this.auth = new GpgAuth();
  }

  /**
   * Execute the controller.
   * @param {object} options Optional parameters
   * - options.requestApi {bool}, get the status from the API, default true.
   */
  async main(options) {
    options = options || {};

    try {
      const isAuthenticated = await this.auth.isAuthenticated(options);
      if (isAuthenticated) {
        this.worker.port.emit(this.requestId, 'SUCCESS', true);
      } else {
        this.worker.port.emit(this.requestId, 'SUCCESS', false);
      }
    } catch (error) {
      this.worker.port.emit(this.requestId, 'ERROR', this.worker.port.getEmitableError(error));
    }
  }

}

exports.AuthIsAuthenticatedController = AuthIsAuthenticatedController;
