/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.0.0
 */
import browser from "../../sdk/polyfill/browserPolyfill";

const CHECK_IS_AUTHENTICATED_INTERVAL_PERIOD = 60000;
const AUTH_SESSION_CHECK_ALARM = "AuthSessionCheck";

class StartLoopAuthSessionCheckService {
  /**
   * Constructor
   * @param {GpgAuth} gpgAuth
   */
  constructor(gpgAuth) {
    this.gpgAuth = gpgAuth;
    this.checkAuthStatus = this.checkAuthStatus.bind(this);
    this.clearAlarm = this.clearAlarm.bind(this);
  }

  /**
   * Exec the StartLoopAuthSessionCheckService
   * @return {Promise<void>}
   */
  async exec() {
    await this.scheduleAuthSessionCheck();
    self.addEventListener("passbolt.auth.after-logout", this.clearAlarm);
  }

  /**
   * Schedule an alarm to check if the user is authenticated.
   * @private
   */
  async scheduleAuthSessionCheck() {
    // Create an alarm to check the auth session
    await browser.alarms.create(AUTH_SESSION_CHECK_ALARM, {
      when: Date.now() + CHECK_IS_AUTHENTICATED_INTERVAL_PERIOD
    });
    browser.alarms.onAlarm.addListener(this.checkAuthStatus);
  }

  /**
   * Clear the alarm and listener configured for flushing the resource if any.
   * @private
   */
  async clearAlarm() {
    browser.alarms.onAlarm.removeListener(this.checkAuthStatus);
    await browser.alarms.clear(AUTH_SESSION_CHECK_ALARM);
  }

  /**
   * Check if the user is authenticated when the AuthSessionCheck alarm triggers.
   * - In the case the user is logged out, trigger a passbolt.auth.after-logout event.
   * @param {Alarm} alarm
   * @private
   */
  async checkAuthStatus(alarm) {
    if (alarm.name === AUTH_SESSION_CHECK_ALARM) {
      if (!await this.gpgAuth.isAuthenticated()) {
        self.dispatchEvent(new Event('passbolt.auth.after-logout'));
      } else {
        await this.scheduleAuthSessionCheck();
      }
    }
  }
}

export default StartLoopAuthSessionCheckService;
