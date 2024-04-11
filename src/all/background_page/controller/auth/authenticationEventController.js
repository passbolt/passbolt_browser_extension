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
 * @since         3.3.0
 */

/**
 * Controller related to the in-form call-to-action
 */
class AuthenticationEventController {
  /**
   * AuthenticationEventController initialiser
   * @param {Worker} worker
   */
  static initialise(worker) {
    this.worker = worker;
  }

  /**
   * Start event listeners.
   */
  static startListen() {
    this.isPortConnected = true;
    this.worker.port._port.onDisconnect.addListener(this.handlePortDisconnected);
  }

  /**
   * Handle when the user is logged in.
   */
  static handleUserLoggedIn() {
    if (this.isPortConnected) {
      this.worker?.port.emit("passbolt.auth.after-login");
    }
  }

  /**
   * Handle when the user is logged out.
   */
  static handleUserLoggedOut() {
    if (this.isPortConnected) {
      this.worker?.port.emit("passbolt.auth.after-logout");
    }
  }

  /**
   * Handle when the port is disconnected
   */
  static handlePortDisconnected() {
    this.isPortConnected = false;
  }
}


export default AuthenticationEventController;
