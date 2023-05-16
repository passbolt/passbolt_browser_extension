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
   * Constructor of the storage service
   */
  constructor() {
    this._handleFlushEvent = this._handleFlushEvent.bind(this);
    this._handleKeepSessionAlive = this._handleKeepSessionAlive.bind(this);
  }

  /**
   * Stores the passphrase in session memory for given a duration.
   * @param {string} passphrase
   * @param {number|null} timeout duration in second before flushing passphrase
   * @return {Promise<void>}
   */
  async set(passphrase, timeout) {
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
      this._keepAliveSession();
    }
  }

  /**
   * Retrieve the passphrase from the session memory if any.
   * @return {Promise<string|null>}
   */
  async get() {
    const storedData = await browser.storage.session.get(PASSPHRASE_STORAGE_KEY);
    return storedData?.[PASSPHRASE_STORAGE_KEY] || null;
  }

  /**
   * Flush the registered passphrase without removing any alarms.
   * @returns {Promise<void>}
   */
  async flushPassphrase() {
    await lock.acquire();
    await browser.storage.session.remove(PASSPHRASE_STORAGE_KEY);
    lock.release();
  }

  /**
   * Returns true if the session is set to be kept until the user logs out.
   * @returns {boolean}
   */
  isSessionKeptUntilLogOut() {
    // we assume that the event listener is present only when the session is no kept until log out.
    return !browser.alarms.onAlarm.hasListener(this._handleFlushEvent);
  }

  /**
   * Removes the stored passphrase from the session memory and resets alarms.
   * @return {Promise<void>}
   */
  async flush() {
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
  async stopSessionKeepAlive() {
    this._clearKeepAliveAlarms();
  }

  /**
   * Clear all the alarms and listeners configured for flushing the passphrase if any.
   * @private
   */
  async _clearFlushAlarms() {
    await browser.alarms.clear(PASSPHRASE_FLUSH_ALARM);
    if (browser.alarms.onAlarm.hasListener(this._handleFlushEvent)) {
      browser.alarms.onAlarm.removeListener(this._handleFlushEvent);
    }
  }

  /**
   * Clear all the alarms and listeners configured for keeping session alive if any.
   * @private
   */
  async _clearKeepAliveAlarms() {
    await browser.alarms.clear(SESSION_KEEP_ALIVE_ALARM);
    if (browser.alarms.onAlarm.hasListener(this._handleKeepSessionAlive)) {
      browser.alarms.onAlarm.removeListener(this._handleKeepSessionAlive);
    }
  }

  /**
   * Flush the current stored passphrase when the PassphraseStorageFlush alarm triggers.
   * @param {Alarm} alarm
   * @private
   */
  async _handleFlushEvent(alarm) {
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
  async _handleKeepSessionAlive(alarm) {
    if (alarm.name !== SESSION_KEEP_ALIVE_ALARM) {
      return;
    }

    if (await this.get() === null) {
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
  _keepAliveSession() {
    browser.alarms.create(SESSION_KEEP_ALIVE_ALARM, {
      delayInMinutes: SESSION_CHECK_INTERNAL,
      periodInMinutes: SESSION_CHECK_INTERNAL
    });

    browser.alarms.onAlarm.addListener(this._handleKeepSessionAlive);
  }
}

export default new PassphraseStorageService();
