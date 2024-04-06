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
import CheckAuthStatusService from "./checkAuthStatusService";
import PostLogoutService from "./postLogoutService";

const CHECK_IS_AUTHENTICATED_INTERVAL_PERIOD = 60000;
const AUTH_SESSION_CHECK_ALARM = "AuthSessionCheck";

class StartLoopAuthSessionCheckService {
  /**
   * Exec the StartLoopAuthSessionCheckService
   * @return {Promise<void>}
   */
  static async exec() {
    await StartLoopAuthSessionCheckService.scheduleAuthSessionCheck();
  }

  /**
   * Schedule an alarm to check if the user is authenticated.
   * @returns {Promise<void>}
   * @private
   */
  static async scheduleAuthSessionCheck() {
    // Create an alarm to check the auth session. This alarm is managed in `handleTopLevelAlarms`
    await browser.alarms.create(StartLoopAuthSessionCheckService.ALARM_NAME, {
      // this `periodInMinutes` is set to ensure that after going back from sleep mode the alarms still triggers
      periodInMinutes: 1,
      when: Date.now() + CHECK_IS_AUTHENTICATED_INTERVAL_PERIOD
    });
  }

  /**
   * Clear the alarm and listener configured for flushing the resource if any.
   * @returns {Promise<void>}
   * @private
   */
  static async clearAlarm() {
    await browser.alarms.clear(StartLoopAuthSessionCheckService.ALARM_NAME);
  }

  /**
   * Check if the user is authenticated when the AuthSessionCheck alarm triggers.
   * - In the case the user is logged out, trigger a passbolt.auth.after-logout event.
   * @param {Alarm} alarm
   * @returns {Promise<void>}
   * @private
   */
  static async handleAuthStatusCheckAlarm(alarm) {
    if (alarm.name !== StartLoopAuthSessionCheckService.ALARM_NAME) {
      return;
    }

    const checkAuthService = new CheckAuthStatusService();
    const authStatus = await checkAuthService.checkAuthStatus(true);
    if (!authStatus.isAuthenticated) {
      PostLogoutService.exec();
    }
  }

  /**
   * Returns the alarm names that this service handles
   * @return {string}
   */
  static get ALARM_NAME() {
    return AUTH_SESSION_CHECK_ALARM;
  }
}

export default StartLoopAuthSessionCheckService;
