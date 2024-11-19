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
import Log from "../../model/log";
import UserPassphraseRequiredError from "passbolt-styleguide/src/shared/error/userPassphraseRequiredError";

const PASSPHRASE_FLUSH_ALARM = "PassphraseStorageFlush";
const PASSPHRASE_STORAGE_KEY = "passphrase";

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
      browser.alarms.create(PassphraseStorageService.ALARM_NAME, {
        when: Date.now() + timeout * 1000
      });
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
   * Retrieve the passphrase from the session storage or fail=.
   * @return {Promise<string|null>}
   * @throws {UserPassphraseRequiredError} If no user passphrase stored.
   */
  static async getOrFail() {
    const passphrase = await this.get();
    if (!passphrase) {
      throw new UserPassphraseRequiredError();
    }

    return passphrase;
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
    ]);
  }

  /**
   * Flush the registered passphrase without removing any alarms.
   * @returns {Promise<void>}
   */
  static flushPassphrase() {
    return navigator.locks.request(PASSPHRASE_STORAGE_KEY, () => browser.storage.session.remove(PASSPHRASE_STORAGE_KEY));
  }

  /**
   * Clear all the alarms and listeners configured for flushing the passphrase if any.
   * @returns {Promise<void>}
   * @private
   */
  static _clearFlushAlarms() {
    return browser.alarms.clear(PassphraseStorageService.ALARM_NAME);
  }

  /**
   * Flush the current stored passphrase when the PassphraseStorageFlush alarm triggers.
   * This is a top-level alarm callback
   * @param {Alarm} alarm
   */
  static async handleFlushEvent(alarm) {
    if (alarm.name === PassphraseStorageService.ALARM_NAME) {
      await PassphraseStorageService.flush();
    }
  }

  /**
   * Returns the PASSPHRASE_FLUSH_ALARM name
   * @returns {string}
   */
  static get ALARM_NAME() {
    return PASSPHRASE_FLUSH_ALARM;
  }
}

export default PassphraseStorageService;
