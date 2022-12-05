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
   * AuthenticationEventController constructor
   * @param {Worker} worker
   */
  constructor(worker) {
    this.worker = worker;
    this.bindCallbacks();
  }

  /**
   * Binds the callbacks
   */
  bindCallbacks() {
    this.handleUserLoggedOut = this.handleUserLoggedOut.bind(this);
    this.handleUserLoggedIn = this.handleUserLoggedIn.bind(this);
    this.handleRemoveListener = this.handleRemoveListener.bind(this);
  }

  /**
   * Start event listeners.
   */
  startListen() {
    self.addEventListener("passbolt.auth.after-logout", this.handleUserLoggedOut);
    self.addEventListener("passbolt.auth.after-login", this.handleUserLoggedIn);
    this.worker.port._port.onDisconnect.addListener(this.handleRemoveListener);
  }

  /**
   * Handle when the user is logged in.
   */
  async handleUserLoggedIn() {
    this.worker.port.emit("passbolt.auth.after-login");
  }

  /**
   * Handle when the user is logged out.
   */
  handleUserLoggedOut() {
    this.worker.port.emit("passbolt.auth.after-logout");
  }

  handleRemoveListener() {
    self.removeEventListener("passbolt.auth.after-logout", this.handleUserLoggedOut);
    self.removeEventListener("passbolt.auth.after-login", this.handleUserLoggedIn);
  }
}


export default AuthenticationEventController;
