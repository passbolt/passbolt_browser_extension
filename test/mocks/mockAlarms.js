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
 * @since         3.7.3
 */

/**
 * Mock class to be used in replacement of chrome.alarms
 */
class MockAlarms {
  constructor() {
    this._registeredAlarms = {};
    this._timeouts = {};
    this._intervals = {};
    this.onAlarm = new OnAlarmEvent();
    this.onAlarm.triggerAlarm = this.onAlarm.triggerAlarm.bind(this);
  }

  /**
   * Register a new alarm by mocking the mecanism with setInterval and setTimeout.
   * @param {string} alarmName the name of the alarm passed as the callback parameter when the alarm triggers
   * @param {object} options the options to define when the alarm triggers and at which frequency
   * @return {Promise<void>} a promise is return to simulate the chrome.alarm API
   */
  async create(alarmName, options) {
    if (!options.periodInMinutes && options.when) { // is a single alarm call
      this._createTimeout(alarmName, options);
    } else if (options.periodInMinutes && options.when) { // is a repeated alarm starting at a given timestamp
      this._createDelayedInterval(alarmName, options);
    } else if (options.periodInMinutes && options.delayInMinutes) { // is a repeated alarm start after a delay
      this._createDelayedInterval(alarmName, options);
    } else if (options.periodInMinutes) { // is a repeated alarm where counter start immediately
      this._createInterval(alarmName, options);
    }
  }

  /**
   * Creates an alarm that triggers only once using a setTimeout under the hood.
   * @param {string} alarmName the name of the alarm passed as the callback parameter when the alarm triggers
   * @param {object} options the options to define when the alarm triggers and at which frequency
   * @private
   */
  _createTimeout(alarmName, options) {
    let scheduledTime = options.when;
    if (!scheduledTime && options.delayInMinutes) {
      scheduledTime = Date.now() + options.delayInMinutes * 60_000;
    }

    const alarm = {
      name: alarmName,
      scheduledTime: scheduledTime,
    };

    const triggerDelay = alarm.scheduledTime - Date.now();

    this._registeredAlarms[alarmName] = alarm;
    const timeout = setTimeout(() => this.onAlarm.triggerAlarm(alarm), triggerDelay);
    this._timeouts[alarmName] = timeout;
  }

  /**
   * Creates a repeating alarm that triggers every `options.periodInMinutes` minute using a setInterval.
   * @param {string} alarmName the name of the alarm passed as the callback parameter when the alarm triggers
   * @param {object} options the options to define when the alarm triggers and at which frequency
   * @private
   */
  _createInterval(alarmName, options) {
    const alarm = {
      name: alarmName,
      periodInMinutes: options.periodInMinutes,
    };

    const triggerDelay = options.periodInMinutes * 60_000;

    this._registeredAlarms[alarmName] = alarm;
    const timeout = setInterval(() => this.onAlarm.triggerAlarm(alarm), triggerDelay);
    this._interval[alarmName] = timeout;
  }

  /**
   * Creates a repeating alarm that triggers every `options.periodInMinutes` minute after a given delay or starting from the given `options.when` timestamp.
   * It uses first a setTimeout as the call is delay then a setInterval takes the relay to do the repeating part.
   * @param {string} alarmName the name of the alarm passed as the callback parameter when the alarm triggers
   * @param {object} options the options to define when the alarm triggers and at which frequency
   * @private
   */
  _createDelayedInterval(alarmName, options) {
    let scheduledTime = options.when;
    if (!scheduledTime && options.delayInMinutes) {
      scheduledTime = Date.now() + options.delayInMinutes * 60_000
    }

    const alarm = {
      name: alarmName,
      periodInMinutes: options.periodInMinutes,
      scheduledTime: scheduledTime,
    };

    this._registeredAlarms[alarmName] = alarm;
    const periodInMinutes = options.periodInMinutes;

    const firstTrigger = setTimeout(() => {
      this.onAlarm.triggerAlarm(alarm);

      // after the first delayed trigger of the series for this alarm we create a regular interval trigger
      const interval = setInterval(() => this.onAlarm.triggerAlarm(alarm), periodInMinutes * 60_000);
      this._intervals[alarmName] = interval;
    }, alarm.scheduledTime - Date.now());

    this._timeouts[alarmName] = firstTrigger;
  }

  /**
   * Returns the alarm configuration given a name or null if none found.
   * @param {string} alarmName
   * @returns {Promise<chrome.alarm|null>}
   */
  async get(alarmName) {
    return this._registeredAlarms[alarmName] || null;
  }

  /**
   * Returns all the registered alarm configurations.
   * @returns {Promise<Array>}
   */
  async getAll() {
    const keys = Object.keys(this._registeredAlarms);
    if (keys.length === 0) {
      return [];
    }

    const alarms = [];
    for (let i = 0; i < keys.length; i++) {
      const alarm = this._registeredAlarms[keys[i]];
      alarms.push(alarm);
    }
    return alarms;
  }

  /**
   * Clears all the timeouts and intervals bounded to an alarm given its name.
   * @param {string} alarmName
   * @returns {Promise<void>}
   */
  async clear(alarmName) {
    delete this._registeredAlarms[alarmName];
    clearTimeout(this._timeouts[alarmName]);
    clearInterval(this._intervals[alarmName]);
  }

  /**
   * Clears all the timeouts and intervals registered.
   * @returns {Promise<void>}
   */
  async clearAll() {
    for (const key in Object.keys(this._timeouts)) {
      clearTimeout(this._timeouts[key]);
    }

    for (const key in Object.keys(this._intervals)) {
      clearInterval(this._intervals[key]);
    }

    this._registeredAlarms = {};
  }

  /**
   * Clean all the mocked alarm data to ensure unit tests are not running with previous tests' data
   * @returns {Promise<void>}
   */
  async clearAllMocks() {
    this.clearAll();
    this.onAlarm = new OnAlarmEvent();
    this.onAlarm.triggerAlarm = this.onAlarm.triggerAlarm.bind(this);
  }
}

class OnAlarmEvent {
  constructor() {
    this._listeners = [];
    this.addListener = this.addListener.bind(this);
    this.removeListener = this.removeListener.bind(this);
    this.hasListener = this.hasListener.bind(this);
    this.triggerAlarm = this.triggerAlarm.bind(this);
  }

  /**
   * Add listerner to be called on chrome.onAlarm triggers
   * @param {func} callback
   */
  addListener(callback) {
    //Remove duplicate listener for desktop app to avoid infinite loop
    this.removeListener(callback);
    this._listeners.push(callback);
  }

  /**
   * Remove a callback from chrome.onAlarm
   * @param {func} callback
   */
  removeListener(callback) {
    if (!this.hasListener(callback)) {
      return;
    }
    const index = this._listeners.indexOf(callback);
    this._listeners.splice(index, 1);
  }

  /**
   * Returns true if the callback is attach as a listener
   * @param {func} callback
   */
  hasListener(callback) {
    const index = this._listeners.indexOf(callback);
    return index > -1;
  }

  /**
   * Triggers the given alarm and run all the attached callbacks
   * @param {chrome.alarm} alarm
   */
  triggerAlarm(alarm) {
    for (let i = 0; i < this._listeners.length; i++) {
      const callback = this._listeners[i];
      callback(alarm);
    }
  }
}

export default MockAlarms;
