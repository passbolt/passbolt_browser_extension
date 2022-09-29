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
import browser from "../../sdk/polyfill/browserPolyfill";
import User from "../../model/user";
import UserService from "../api/user/userService";
import Log from "../../model/log";
import Lock from "../../utils/lock";
const lock = new Lock();

const PASSPHRASE_FLUSH_ALARM = "PassphraseStorageFlush";
const SESSION_KEEP_ALIVE_ALARM = "SessionKeepAlive";
const PASSPHRASE_STORAGE_KEY = "passphrase";
const SESSION_CHECK_INTERNAL = 15;

class PassphraseStorageService {
  /**
   * Initialisation the storage service
   * @returns {Promise<void>}
   */
  static async init() {
    this._handleFlushEvent = this._handleFlushEvent.bind(this);
    this._handleKeepSeesionAlive = this._handleKeepSeesionAlive.bind(this);
    await this.flush();
  }

  /**
   * Stores the passphrase in session memory for given a duration.
   * @param {string} passphrase
   * @param {number|null} timeout duration in second before flushing passphrase
   * @return {Promise<void>}
   */
  static async set(passphrase, timeout) {
    await lock.acquire();
    await browser.storage.session.set({[PASSPHRASE_STORAGE_KEY]: passphrase});
    lock.release();

    await this._clearFlushAlarms();
    if (timeout >= 0) {
      const flushingTime = Date.now() + timeout * 1000;
      browser.alarms.create(PASSPHRASE_FLUSH_ALARM, {
        when: flushingTime
      });
      browser.alarms.onAlarm.addListener(this._handleFlushEvent);
    }

    const keepAliveAlarm = await browser.alarms.get(SESSION_KEEP_ALIVE_ALARM);
    if (!keepAliveAlarm) {
      this._clearKeepAliveAlarms(); //@todo check if needed
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
   * Flush the registered passphrase without removing any alarms.
   * @returns {Promise<void>}
   */
  static async flushPassphrase() {
    await lock.acquire();
    await browser.storage.session.remove(PASSPHRASE_STORAGE_KEY);
    lock.release();
  }

  /**
   * Removes the stored passphrase from the session memory and resets alarms.
   * @return {Promise<void>}
   */
  static async flush() {
    Log.write({level: 'debug', message: 'PassphraseStorageService flushed'});
    return Promise.all([
      this.flushPassphrase(),
      this._clearFlushAlarms(),
      this._clearKeepAliveAlarms(),
    ]);
  }

  /**
   * Removes the stored passphrase from the session memory.
   * @return {Promise<void>}
   */
  static async stopSessionKeepAlive() {
    this._clearKeepAliveAlarms();
  }

  /**
   * Clear all the alarms and listeners configured for flushing the passphrase if any.
   * @private
   */
  static async _clearFlushAlarms() {
    await browser.alarms.clear(PASSPHRASE_FLUSH_ALARM);
    if (browser.alarms.onAlarm.hasListener(this._handleFlushEvent)) {
      browser.alarms.onAlarm.removeListener(this._handleFlushEvent);
    }
  }

  /**
   * Clear all the alarms and listeners configured for keeping session alive if any.
   * @private
   */
  static async _clearKeepAliveAlarms() {
    await browser.alarms.clear(SESSION_KEEP_ALIVE_ALARM);
    if (browser.alarms.onAlarm.hasListener(this._handleKeepSeesionAlive)) {
      browser.alarms.onAlarm.removeListener(this._handleKeepSeesionAlive);
    }
  }

  /**
   * Flush the current stored passphrase when the PassphraseStorageFlush alarm triggers.
   * @param {Alarm} alarm
   * @private
   */
  static async _handleFlushEvent(alarm) {
    if (alarm.name === PASSPHRASE_FLUSH_ALARM) {
      await this.flush();
    }
  }

  /**
   * Keep the current session alive
   * @param {Alarm} alarm
   * @returns {Promise<void>}
   * @private
   */
  static _handleKeepSeesionAlive(alarm) {
    if (alarm.name !== SESSION_KEEP_ALIVE_ALARM) {
      return;
    }

    const idleInterval = SESSION_CHECK_INTERNAL * 60; //idle time in seconds
    browser.idle.queryState(idleInterval).then(async idleState => {
      if (idleState !== 'active' || this._masterPassword === null) {
        return;
      }

      const apiClientOptions = User.getInstance().getApiClientOptions();
      const userService = new UserService(apiClientOptions);
      await userService.keepSessionAlive();
    });
  }

  /**
   * Creates an alarm to ensure session is kept alive.
   */
  static _keepAliveSession() {
    browser.alarms.create(SESSION_KEEP_ALIVE_ALARM, {
      delayInMinutes: SESSION_CHECK_INTERNAL,
      periodInMinutes: SESSION_CHECK_INTERNAL
    });

    browser.alarms.onAlarm.addListener(this._handleKeepSeesionAlive);
  }
}

export default PassphraseStorageService;
