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
import PortManager from "../../sdk/port/portManager";
import WorkersSessionStorage from "../sessionStorage/workersSessionStorage";
import BrowserTabService from "../ui/browserTab.service";
import WorkerEntity from "../../model/entity/worker/workerEntity";
import WebNavigationService from "../webNavigation/webNavigationService";

const WORKER_EXIST_TIME_CHECKING = 100;
const WORKER_CHECK_STATUS_TIME_CHECKING = 50;

class WorkerService {
  static timeoutByWorkerID = {};

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
   * @param {int} numberOfRetry The number of retry before rejecting the promise
   * @return {Promise<void>}
   */
  static async waitExists(applicationName, tabId, numberOfRetry = 50) {
    // Handle worker exist and check 50 times (5 seconds)
    const handleWorkerExist = async(resolve, reject, numberOfRetry) => {
      try {
        await this.get(applicationName, tabId);
        resolve();
      } catch (error) {
        if (numberOfRetry <= 0) {
          reject(error);
        } else {
          // Use timeout cause alarm are fired at a minimum of 30 seconds
          setTimeout(handleWorkerExist, WORKER_EXIST_TIME_CHECKING, resolve, reject, numberOfRetry - 1);
        }
      }
    };

    return new Promise((resolve, reject) => {
      handleWorkerExist(resolve, reject, numberOfRetry);
    });
  }

  /**
   * Clear and use a timeout to execute a navigation for worker which are waiting for connection
   * @params {WorkerEntity} The worker entity
   * @returns {Promise<void>}
   */
  static async checkAndExecNavigationForWorkerWaitingConnection(workerEntity) {
    // Clear timeout to take only the last event of the worker to check
    clearTimeout(this.timeoutByWorkerID[workerEntity.id]);
    // Use timeout cause alarm are fired at a minimum of 30 seconds
    this.timeoutByWorkerID[workerEntity.id] = setTimeout(this.execNavigationForWorkerWaitingConnection, WORKER_CHECK_STATUS_TIME_CHECKING, workerEntity.id);
  }

  /**
   * Exec a navigation for worker block in waiting connection status
   * @private
   * @param {string} workerId
   * @return {Promise<void>}
   */
  static async execNavigationForWorkerWaitingConnection(workerId) {
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

export default WorkerService;
