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
 * @since         4.1.2
 */
import browser from "../../sdk/polyfill/browserPolyfill";
import {v4 as uuidv4} from "uuid";

const PROMISE_TIMEOUT = 500;
class PromiseTimeoutService {
  /**
   * Resolve promise with timeout
   * @param promise The promise
   * @param {number} timeout The timeout
   * @return {Promise<unknown>}
   */
  static exec(promise, timeout = PROMISE_TIMEOUT) {
    return new Promise((resolve, reject) => {
      const alarmName = uuidv4();
      // Handle promise timeout
      const handlePromiseTimeout = alarm => {
        if (alarm.name === alarmName) {
          this.clearPromiseTimeoutAlarm(alarmName, handlePromiseTimeout);
          reject();
        }
      };
      // Schedule promise timeout
      this.schedulePromiseTimeout(alarmName, handlePromiseTimeout, timeout);
      // Clear promise timeout alarm
      const clearTimeout = () => this.clearPromiseTimeoutAlarm(alarmName, handlePromiseTimeout);
      // return the promise resolved else reject and finally clear timeout
      promise.then(resolve).catch(reject).finally(clearTimeout);
    });
  }

  /**
   * Schedule an alarm to reject the promise
   * @param {string} alarmName The alarm name
   * @param {function} handlePromiseTimeout The function on alarm listener
   * @param {number} timeout The timeout in ms
   * @private
   */
  static schedulePromiseTimeout(alarmName, handlePromiseTimeout, timeout) {
    // Create an alarm to reject the promise after a given time
    browser.alarms.create(alarmName, {
      when: Date.now() + timeout
    });
    browser.alarms.onAlarm.addListener(handlePromiseTimeout);
  }

  /**
   * Clear the alarm and listener configured for rejecting the promise.
   * @param {string} alarmName The alarm name
   * @param {function} handlePromiseTimeout The function on alarm listener
   * @private
   */
  static clearPromiseTimeoutAlarm(alarmName, handlePromiseTimeout) {
    browser.alarms.onAlarm.removeListener(handlePromiseTimeout);
    browser.alarms.clear(alarmName);
  }
}

export default PromiseTimeoutService;

