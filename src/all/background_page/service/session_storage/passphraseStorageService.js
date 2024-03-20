/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.8.0
 */
import User from "../../model/user";
import UserService from "../api/user/userService";
import Log from "../../model/log";

const PASSPHRASE_FLUSH_ALARM = "PassphraseStorageFlush";
const SESSION_KEEP_ALIVE_ALARM = "SessionKeepAlive";
const PASSPHRASE_STORAGE_KEY = "passphrase";
const SESSION_CHECK_INTERNAL = 15;

class PassphraseStorageService {
  /**
   * Stores the passphrase in session memory for given a duration.
   * @param {string} passphrase
   * @param {number|null} timeout duration in second before flushing passphrase
   * @return {Promise<void>}
   */
  static async set(passphrase, timeout) {
    await navigator.locks.request(PASSPHRASE_STORAGE_KEY, async() => {
      await browser.storage.session.set({[PASSPHRASE_STORAGE_KEY]: passphrase});
    });

    PassphraseStorageService._clearFlushAlarms();
    if (timeout >= 0) {
      browser.alarms.create(PASSPHRASE_FLUSH_ALARM, {
        when: Date.now() + timeout * 1000
      });
    }

    const keepAliveAlarm = await browser.alarms.get(SESSION_KEEP_ALIVE_ALARM);
    if (!keepAliveAlarm) {
      this._keepAliveSession();
    }
  }

  /**
   * Retrieve the passphrase from the session memory if any.
   * @return {Promise<string|null>}
   */
  static async get() {
    const storedData = await browser.storage.session.get(PASSPHRASE_STORAGE_KEY);
    return storedData?.[PASSPHRASE_STORAGE_KEY] || null;
  }

  /**
   * Returns true if the session is set to be kept until the user logs out.
   * @returns {boolean}
   */
  static isSessionKeptUntilLogOut() {
    // we assume that the event listener is present only when the session is no kept until log out.
    return !browser.alarms.onAlarm.hasListener(PassphraseStorageService.handleFlushEvent);
  }

  /**
   * Removes the stored passphrase from the session memory and resets alarms.
   * @return {Promise<void>}
   */
  static async flush() {
    Log.write({level: 'debug', message: 'PassphraseStorageService flushed'});
    return Promise.all([
      PassphraseStorageService.flushPassphrase(),
      PassphraseStorageService._clearFlushAlarms(),
      PassphraseStorageService._clearKeepAliveAlarms(),
    ]);
  }

  /**
   * Flush the registered passphrase without removing any alarms.
   * @returns {Promise<void>}
   */
  static async flushPassphrase() {
    await navigator.locks.request(PASSPHRASE_STORAGE_KEY, async() => {
      await browser.storage.session.remove(PASSPHRASE_STORAGE_KEY);
    });
  }

  /**
   * Clear all the alarms and listeners configured for flushing the passphrase if any.
   * @private
   */
  static _clearFlushAlarms() {
    browser.alarms.clear(PASSPHRASE_FLUSH_ALARM);
  }

  /**
   * Clear all the alarms and listeners configured for keeping session alive if any.
   * @private
   */
  static async _clearKeepAliveAlarms() {
    await browser.alarms.clear(SESSION_KEEP_ALIVE_ALARM);
    if (browser.alarms.onAlarm.hasListener(PassphraseStorageService._handleKeepSessionAlive)) {
      browser.alarms.onAlarm.removeListener(PassphraseStorageService._handleKeepSessionAlive);
    }
  }

  /**
   * Removes the stored passphrase from the session memory.
   * @return {Promise<void>}
   */
  static stopSessionKeepAlive() {
    this._clearKeepAliveAlarms();
  }

  /**
   * Flush the current stored passphrase when the PassphraseStorageFlush alarm triggers.
   * This is a top-level alarm callback
   * @param {Alarm} alarm
   */
  static async handleFlushEvent(alarm) {
    if (alarm.name === PASSPHRASE_FLUSH_ALARM) {
      await PassphraseStorageService.flush();
    }
  }

  /**
   * Keep the current session alive
   * @param {Alarm} alarm
   * @returns {Promise<void>}
   * @private
   */
  static async _handleKeepSessionAlive(alarm) {
    if (alarm.name !== SESSION_KEEP_ALIVE_ALARM) {
      return;
    }

    if (await PassphraseStorageService.get() === null) {
      return;
    }

    const user = User.getInstance();
    const apiClientOptions = await user.getApiClientOptions();
    const userService = new UserService(apiClientOptions);
    userService.keepSessionAlive();
  }

  /**
   * Creates an alarm to ensure session is kept alive.
   */
  static _keepAliveSession() {
    browser.alarms.create(SESSION_KEEP_ALIVE_ALARM, {
      delayInMinutes: SESSION_CHECK_INTERNAL,
      periodInMinutes: SESSION_CHECK_INTERNAL
    });

    browser.alarms.onAlarm.addListener(this._handleKeepSessionAlive);
  }

  /**
   * Returns the PASSPHRASE_FLUSH_ALARM name
   * @returns {string}
   */
  static get PASSPHRASE_FLUSH_ALARM_NAME() {
    return PASSPHRASE_FLUSH_ALARM;
  }
}

export default PassphraseStorageService;
