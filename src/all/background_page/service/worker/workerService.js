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
import PromiseTimeoutService from "../../utils/promise/promiseTimeoutService";

const WORKER_EXIST_TIME_CHECKING = 100;
const WORKER_CHECK_STATUS_TIME_CHECKING = 50;
const WORKER_RECONNECT_PORT_TIMEOUT = 1000;

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
    return { port, tab };
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
    const handleWorkerExist = async (resolve, reject, numberOfRetry) => {
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
   * @param {WorkerEntity} workerEntity The worker entity
   * @returns {Promise<void>}
   */
  static async checkAndExecNavigationForWorkerWaitingConnection(workerEntity) {
    // Clear timeout to take only the last event of the worker to check
    clearTimeout(this.timeoutByWorkerID[workerEntity.id]);
    // Use timeout cause alarm are fired at a minimum of 30 seconds
    this.timeoutByWorkerID[workerEntity.id] = setTimeout(
      this.execNavigationForWorkerWaitingConnection,
      WORKER_CHECK_STATUS_TIME_CHECKING,
      workerEntity.id,
    );
  }

  /**
   * Treat debounced navigation due to worker awaiting initial connection or reconnection with the content script
   * application.
   * @private
   * @param {string} workerId The worker identifier.
   * @return {Promise<void>}
   */
  static async execNavigationForWorkerWaitingConnection(workerId) {
    const worker = await WorkersSessionStorage.getWorkerById(workerId);
    if (!worker) {
      console.debug(`WorkerService::execNavigationForWorkerWaitingConnection(${workerId}): Worker not found.`);
      return;
    }

    const workerEntity = new WorkerEntity(worker);
    if (!workerEntity.isWaitingConnection && !workerEntity.isReconnecting) {
      console.debug(
        `WorkerService::execNavigationForWorkerWaitingConnection(${workerId}): Worker port connected to the content script application.`,
      );
      return;
    }

    // Get the tab information by tab id to have the last url in case of redirection
    const tab = await BrowserTabService.getById(workerEntity.tabId);
    // Execute the process of a web navigation to detect pagemod and script to insert
    const frameDetails = {
      // Mapping the tab info as a frame details to be compliant with webNavigation API
      frameId: 0,
      tabId: worker.tabId,
      url: tab.url,
    };

    console.debug(
      `WorkerService::execNavigationForWorkerWaitingConnection(${workerId}): Trigger pagemods identification process.`,
    );
    await WebNavigationService.exec(frameDetails);
  }

  /**
   * Send message to destroy all worker to invalidate content script
   * @param {Array<string>} workersName
   * @return {Promise<void>}
   */
  static async destroyWorkersByName(workersName) {
    this.emitOnWorkersWithName("passbolt.content-script.destroy", workersName);
  }

  /**
   * Emit an event to all workers matching the given workersName
   * @param {string} eventName
   * @param {Array<string>} workersName
   * @return {Promise<void>}
   */
  static async emitOnWorkersWithName(eventName, workersName) {
    const workers = await WorkersSessionStorage.getWorkersByNames(workersName);
    // Emit in parallel so that a worker slow to answer does not delay the others.
    await Promise.allSettled(workers.map((worker) => this.emitOnWorker(eventName, worker)));
  }

  /**
   * Emit an event on a worker, reconnecting its port first if needed.
   * @param {string} eventName
   * @param {object} worker
   * @return {Promise<void>}
   * @private
   */
  static async emitOnWorker(eventName, worker) {
    if (!PortManager.isPortExist(worker.id)) {
      try {
        await this.reconnectPort(worker);
      } catch (error) {
        console.debug("Unable to reconnect the port prior to emitting event");
        console.error(error);
        return;
      }
    }
    const port = PortManager.getPortById(worker.id);
    port.emit(eventName);
  }

  /**
   * Request the content script of a worker to reconnect its port.
   * On Edge, messages sent to a sleeping (frozen) tab never resolve until the tab wakes up, so sleeping tabs are
   * skipped and the request is bounded by a timeout.
   * @see https://github.com/microsoft/MicrosoftEdge-Extensions/issues/134
   * @param {object} worker
   * @return {Promise<void>}
   * @throws {Error} If the tab is asleep or the content script does not answer in time.
   * @private
   */
  static async reconnectPort(worker) {
    const tab = await browser.tabs.get(worker.tabId);
    if (tab?.frozen || tab?.discarded) {
      throw new Error(`The tab ${worker.tabId} is asleep, its worker port cannot be reconnected.`);
    }
    const sendMessagePromise = BrowserTabService.sendMessage(worker, "passbolt.port.connect", worker.id);
    await PromiseTimeoutService.exec(sendMessagePromise, WORKER_RECONNECT_PORT_TIMEOUT);
  }
}

export default WorkerService;
