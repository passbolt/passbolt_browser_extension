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
 * @since         4.0.0
 */
import {v4 as uuid} from "uuid";
import PortManager from "../../sdk/port/portManager";
import WorkersSessionStorage from "../sessionStorage/workersSessionStorage";
import BrowserTabService from "../ui/browserTab.service";
import WorkerEntity from "../../model/entity/worker/workerEntity";
import WebNavigationService from "../webNavigation/webNavigationService";

const WORKER_EXIST_ALARM = "WorkerExistFlush";
const WORKER_EXIST_ALARM_TIME_CHECKING = 100;
const WORKER_CHECK_STATUS_ALARM = 'workerId-';
const WORKER_CHECK_STATUS_ALARM_TIME_CHECKING = 50;

class WorkerService {
  /**
   *
   * Get the worker according to the application name and tab id
   *
   * @param {string} applicationName The application name
   * @param {number} tabId The tab id
   * @returns {Promise<Worker>} The worker
   */
  static async get(applicationName, tabId) {
    const workers = await WorkersSessionStorage.getWorkersByNameAndTabId(applicationName, tabId);
    if (workers.length === 0) {
      throw new Error(`Could not find worker ${applicationName} for tab ${tabId}.`);
    }
    // Get only the first worker
    const worker = workers[0];
    if (!PortManager.isPortExist(worker.id)) {
      await BrowserTabService.sendMessage(worker, "passbolt.port.connect", worker.id);
    }
    const port = await PortManager.getPortById(worker.id);
    const tab = port._port.sender.tab;
    return {port, tab};
  }

  /**
   * Wait until a worker exists
   * @param {string} applicationName The application name
   * @param {number} tabId The tab identifier on which the worker runs
   * @param {int} timeout The timeout after which the promise fails if the worker is not found
   * @return {Promise<void>}
   */
  static waitExists(applicationName, tabId, timeout = 10000) {
    const timeoutMs = Date.now() + timeout;
    const alarmName = `${WORKER_EXIST_ALARM}-${uuid()}`;
    return new Promise((resolve, reject) => {
      const handleWorkerExist = async alarm => {
        if (alarm.name === alarmName) {
          try {
            this.clearAlarm(alarmName, handleWorkerExist);
            await this.get(applicationName, tabId);
            resolve();
          } catch (error) {
            if (alarm.scheduledTime >= timeoutMs) {
              reject(error);
            } else {
              this.createAlarm(alarmName, WORKER_EXIST_ALARM_TIME_CHECKING, handleWorkerExist);
            }
          }
        }
      };
      this.createAlarm(alarmName, WORKER_EXIST_ALARM_TIME_CHECKING, handleWorkerExist);
    });
  }

  /**
   * Clear and create alarm to execute a navigation for worker which are waiting for connection
   * @params {WorkerEntity} The worker entity
   * @returns {Promise<void>}
   */
  static async checkAndExecNavigationForWorkerWaitingConnection(workerEntity) {
    const alarmName = `${WORKER_CHECK_STATUS_ALARM}${workerEntity.id}`;
    await this.clearAlarm(alarmName, this.execNavigationForWorkerWaitingConnection);
    await this.createAlarm(alarmName, WORKER_CHECK_STATUS_ALARM_TIME_CHECKING, this.execNavigationForWorkerWaitingConnection);
  }

  /**
   * Create alarm
   * @param {string} alarmName The alarm name
   * @param {number} timeInMs The time when the alarm fire
   * @param {function} handleAlarmEvent The function on alarm listener
   */
  static createAlarm(alarmName, timeInMs, handleAlarmEvent) {
    // Create an alarm to check if the worker exist
    browser.alarms.create(alarmName, {
      when: Date.now() + timeInMs
    });
    browser.alarms.onAlarm.addListener(handleAlarmEvent);
  }

  /**
   * Clear the alarm and listener configured.
   * @param {string} alarmName The alarm name
   * @param {function} handleAlarmEvent The function on alarm listener
   */
  static clearAlarm(alarmName, handleAlarmEvent) {
    browser.alarms.onAlarm.removeListener(handleAlarmEvent);
    browser.alarms.clear(alarmName);
  }

  /**
   * Exec a navigation for worker block in waiting connection status
   * @private
   * @param {Object} alarm
   * @return {Promise<void>}
   */
  static async execNavigationForWorkerWaitingConnection(alarm) {
    if (alarm.name.startsWith(WORKER_CHECK_STATUS_ALARM)) {
      const workerId = alarm.name.substring(WORKER_CHECK_STATUS_ALARM.length);
      const worker = await WorkersSessionStorage.getWorkerById(workerId);
      if (!worker) {
        console.debug("No worker has been found");
        return;
      }
      const workerEntity = new WorkerEntity(worker);
      if (workerEntity.isWaitingConnection) {
        // Get the tab information by tab id to have the last url in case of redirection
        const tab = await BrowserTabService.getById(workerEntity.tabId);
        // Execute the process of a web navigation to detect pagemod and script to insert
        const frameDetails = {
          // Mapping the tab info as a frame details to be compliant with webNavigation API
          frameId: 0,
          tabId: worker.tabId,
          url: tab.url
        };
        await WebNavigationService.exec(frameDetails);
      }
    }
  }
}

export default WorkerService;
