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
import User from "../../model/user";
import UserService from "../api/user/userService";
import PassphraseStorageService from "./passphraseStorageService";

const SESSION_KEEP_ALIVE_ALARM = "SessionKeepAlive";
const SESSION_CHECK_INTERNAL = 15;

class KeepSessionAliveService {
  /**
   * Keeps the user session alive.
   * @return {Promise<void>}
   */
  static async start() {
    const keepAliveAlarm = await browser.alarms.get(KeepSessionAliveService.ALARM_NAME);
    if (!keepAliveAlarm) {
      await this._keepAliveSession();
    }
  }

  /**
   * Check if this service is started.
   * @returns {Promise<boolean>}
   */
  static async isStarted() {
    return Boolean(await browser.alarms.get(KeepSessionAliveService.ALARM_NAME));
  }

  /**
   * Removes the stored passphrase from the session memory.
   * @return {Promise<void>}
   */
  static async stop() {
    await browser.alarms.clear(KeepSessionAliveService.ALARM_NAME);
    if (browser.alarms.onAlarm.hasListener(KeepSessionAliveService.handleKeepSessionAlive)) {
      browser.alarms.onAlarm.removeListener(KeepSessionAliveService.handleKeepSessionAlive);
    }
  }

  /**
   * Keep the current session alive
   * @param {Alarm} alarm
   * @returns {Promise<void>}
   */
  static async handleKeepSessionAlive(alarm) {
    if (alarm.name !== KeepSessionAliveService.ALARM_NAME) {
      return;
    }

    // The session is kept alive only for the duration users wanted their passphrase to be remembered.
    if (await PassphraseStorageService.get() === null) {
      return;
    }

    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const userService = new UserService(apiClientOptions);
    userService.keepSessionAlive();
  }

  /**
   * Creates an alarm to ensure session is kept alive.
   * @returns {Promise<void>}
   * @private
   */
  static async _keepAliveSession() {
    await browser.alarms.create(KeepSessionAliveService.ALARM_NAME, {
      delayInMinutes: SESSION_CHECK_INTERNAL,
      periodInMinutes: SESSION_CHECK_INTERNAL
    });

    await browser.alarms.onAlarm.addListener(KeepSessionAliveService.handleKeepSessionAlive);
  }

  /**
   * Returns the SESSION_KEEP_ALIVE_ALARM name
   * @returns {string}
   */
  static get ALARM_NAME() {
    return SESSION_KEEP_ALIVE_ALARM;
  }
}

export default KeepSessionAliveService;
