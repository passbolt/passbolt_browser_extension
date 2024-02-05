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
 * @since         4.0.0
 */
import Port from "../port";
import PagemodManager from "../../pagemod/pagemodManager";
import WorkersSessionStorage from "../../service/sessionStorage/workersSessionStorage";
import WorkerEntity from "../../model/entity/worker/workerEntity";
import browser from "../polyfill/browserPolyfill";
import workersSessionStorage from "../../service/sessionStorage/workersSessionStorage";

class PortManager {
  constructor() {
    this._ports = {}; // Object{portId: port, ...} for which the port is available
    this.onPortConnect = this.onPortConnect.bind(this);
    this.onTabRemoved = this.onTabRemoved.bind(this);
    this.onStorageUpdate = this.onStorageUpdate.bind(this);
  }

  /**
   * on port connect
   * @param port the port
   * @returns {Promise<void>}
   */
  async onPortConnect(port) {
    if (await this.isQuickAccessPort(port.sender)) {
      // Quickaccess is not stored in the session storage and there is no worker entity referenced
      await this.registerAndAttachEvent(port, "QuickAccess");
    } else {
      await this.connectPortFromTab(port);
    }
  }

  /**
   * Connect port from tab
   * @param port the port
   * @returns {Promise<void>}
   */
  async connectPortFromTab(port) {
    const worker = await WorkersSessionStorage.getWorkerById(port.name);
    if (worker) {
      const workerEntity = new WorkerEntity(worker);
      /*
       * If a port is already connected and is still in memory it should not be registered again
       * In the MV3 case the memory is flushed when the servoce worker is down so the port should be able to reconnect
       */
      if (!this.isPortExist(port.name) && await this.isKnownPortSender(workerEntity, port.sender)) {
        await this.updateWorkerStatus(workerEntity);
        await this.registerAndAttachEvent(port, workerEntity.name);
      } else {
        console.debug(`A known port has been denied connection or reconnection with name=${port.name}, tabUrl=${port.sender.tab.url}, tabId=${port.sender.tab.id}, frameId=${port.sender.frameId}`);
      }
    } else {
      // If there is no worker associate to this port
      console.debug(`An unknown port has been denied connection with name=${port.name}, tabUrl=${port.sender.tab.url}, tabId=${port.sender.tab.id}, frameId=${port.sender.frameId}`);
    }
  }

  /**
   * Is quickAccess port sender
   * @param sender
   * @returns {Promise<boolean>}
   */
  async isQuickAccessPort(sender) {
    if (sender.tab) {
      // Tab property will only be present when the connection was opened from a tab
      return false;
    } else if (sender.origin === "null") {
      /*
       * Safari quickaccess port neither have a tab nor a url property but have a origin set with the string "null"
       * Typically sender is set like this: {id: "com.passbolt.Passbolt-Safari-Extension.Extension (UNSIGNED)", origin: "null"}
       */
      return true;
    } else {
      // The sender is a script running in an extension page
      const popupUrl = await browser.action.getPopup({});
      return sender.url === popupUrl;
    }
  }

  /**
   * Is known port sender
   * @param {WorkerEntity} worker The worker
   * @param sender The sender
   * @returns {Promise<boolean>}
   */
  async isKnownPortSender(worker, sender) {
    // Iframe application connecting for the first time are not know therefor their frame id is not yet associated
    if (worker.frameId === null) {
      worker.frameId = sender.frameId;
    }
    return worker.tabId === sender.tab.id && worker.frameId === sender.frameId;
  }

  /**
   * Register and attach event to the port
   * @param port The port
   * @param {string} name The pagemod name
   * @returns {Promise<void>}
   */
  async registerAndAttachEvent(port, name) {
    const portWrapper = new Port(port);
    this.registerPort(portWrapper);
    await PagemodManager.attachEventToPort(portWrapper, name);
    portWrapper.emit('passbolt.port.ready');
  }

  /**
   * Update the worker status
   * @param {WorkerEntity} worker The worker
   * @return {Promise<void>}
   */
  async updateWorkerStatus(worker) {
    worker.status = WorkerEntity.STATUS_CONNECTED;
    await WorkersSessionStorage.updateWorker(worker);
  }

  /**
   * Register the port
   * @param port
   */
  registerPort(port) {
    this._ports[port._port.name] = port;
  }

  /**
   * Disconnect and remove the port
   * @param {string} id the id
   * @param {object} removeInfo The remove info
   * @returns <void>
   */
  removePort(id, removeInfo = null) {
    // The port will be disconnected automatically after a tab is removed
    if (!removeInfo) {
      // Disconnect the port manually when the user navigate to another page (browser will disconnect too late)
      this._ports[id]?.disconnect();
    }
    delete this._ports[id];
  }

  /**
   * Is port exist
   * @param {string} id The id
   * @returns {boolean}
   */
  isPortExist(id) {
    return Boolean(this._ports[id]);
  }

  /**
   * Get the port by id
   * @param {string} id The id
   * @returns {Port}
   */
  getPortById(id) {
    return this._ports[id];
  }

  /**
   * Flush.
   * @returns {Promise<void>}
   */
  async flush() {
    this._ports = {};
    await WorkersSessionStorage.flush();
  }

  /**
   * On tab removed, remove associated worker from the session storage and delete runtime ports references.
   * @param {number} tabId The tab id
   * @param {object} removeInfo The remove info (only present on tab on removed event)
   * @returns {Promise<void>}
   */
  async onTabRemoved(tabId, removeInfo = null) {
    if (typeof tabId === "undefined") {
      throw new Error("A tab identifier is required.");
    }
    if (!Number.isInteger(tabId)) {
      throw new Error("The tab identifier should be a valid integer.");
    }
    const workers = await WorkersSessionStorage.getWorkersByTabId(tabId);
    workers.forEach(worker => this.removePort(worker.id, removeInfo));
    await WorkersSessionStorage.deleteByTabId(tabId);
  }

  async onStorageUpdate(updatedData) {
    const workers = await workersSessionStorage.getWorkers();
    for (let i = 0; i < workers.length; i++) {
      const workerId = workers[i].id;
      this._ports[workerId]?.emit('passbolt.local-storage.update', updatedData);
    }
  }
}

export default new PortManager();
