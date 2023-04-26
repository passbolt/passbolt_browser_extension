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
import browser from "../../sdk/polyfill/browserPolyfill";
import PortManager from "../../sdk/port/portManager";
import WorkersSessionStorage from "../sessionStorage/workersSessionStorage";
import BrowserTabService from "../ui/browserTab.service";

const WORKER_EXIST_ALARM = "WorkerExistFlush";

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
    return new Promise((resolve, reject) => {
      const handleWorkerExist = async alarm => {
        if (alarm.name === WORKER_EXIST_ALARM) {
          try {
            this.clearAlarm(handleWorkerExist);
            await this.get(applicationName, tabId);
            resolve();
          } catch (error) {
            if (alarm.scheduledTime >= timeoutMs) {
              reject(error);
            } else {
              this.createAlarm(handleWorkerExist);
            }
          }
        }
      };
      this.createAlarm(handleWorkerExist);
    });
  }

  /**
   * Create alarm to flush the resource
   * @private
   * @param {function} handleFlushEvent The function on alarm listener
   */
  static createAlarm(handleFlushEvent) {
    // Create an alarm to check if the worker exist
    browser.alarms.create(WORKER_EXIST_ALARM, {
      when: Date.now() + 100
    });
    browser.alarms.onAlarm.addListener(handleFlushEvent);
  }

  /**
   * Clear the alarm and listener configured for flushing the resource if any.
   * @private
   * @param {function} handleFlushEvent The function on alarm listener
   */
  static clearAlarm(handleFlushEvent) {
    browser.alarms.onAlarm.removeListener(handleFlushEvent);
    browser.alarms.clear(WORKER_EXIST_ALARM);
  }
}

export default WorkerService;
