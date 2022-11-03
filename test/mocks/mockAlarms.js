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
 * At the moment, only triggers an alarm once.
 */
class MockAlarms {
  constructor() {
    this._registeredAlarms = {};
    this._timeouts = {};
    this.onAlarm = new OnAlarmEvent();
    this.onAlarm.triggerAlarm = this.onAlarm.triggerAlarm.bind(this);
  }

  async create(alarmName, options) {
    const alarm = {
      name: alarmName,
      periodInMinutes: options.periodInMinutes,
      scheduledTime: options.when || Date.now() + options.delayInMinutes * 1000 * 60,
    };

    this._registeredAlarms[alarmName] = alarm;
    const timeout = setTimeout(() => this.onAlarm.triggerAlarm(alarm), alarm.scheduledTime - Date.now());
    this._timeouts[alarmName] = timeout;
  }

  async get(alarmName) {
    return this._registeredAlarms[alarmName] || null;
  }

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

  async clear(alarmName) {
    delete this._registeredAlarms[alarmName];
  }

  async clearAll() {
    this._registeredAlarms = {};
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
  addListener(callback) {
    this._listeners.push(callback);
  }

  removeListener(callback) {
    if (!this.hasListener(callback)) {
      return;
    }
    const index = this._listeners.indexOf(callback);
    this._listeners.splice(index, 1);
  }

  hasListener(callback) {
    const index = this._listeners.indexOf(callback);
    return index > -1;
  }

  triggerAlarm(alarm) {
    for (let i = 0; i < this._listeners.length; i++) {
      const callback = this._listeners[i];
      callback(alarm);
    }
  }
}

export default MockAlarms;
