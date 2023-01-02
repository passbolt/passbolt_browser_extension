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
import Port from "../../all/background_page/sdk/port";
import PagemodManager from "../pagemod/pagemodManager";
import WorkersSessionStorage from "../service/sessionStorage/workersSessionStorage";
import WorkerEntity from "../../all/background_page/model/entity/worker/workerEntity";

class PortManager {
  constructor() {
    this._ports = {}; // Object{portId: port, ...} for which the port is available
    this.onPortConnect = this.onPortConnect.bind(this);
    this.onTabRemoved = this.onTabRemoved.bind(this);
  }

  /**
   * on port connect
   * @param port the port
   * @returns {Promise<void>}
   */
  async onPortConnect(port) {
    const worker = await WorkersSessionStorage.getWorkerById(port.name);
    if (worker) {
      if (await this.isKnownPortSender(worker, port.sender)) {
        const portWrapper = new Port(port);
        this.registerPort(portWrapper);
        await PagemodManager.attachEventToPort(portWrapper, worker.name);
        portWrapper.emit('passbolt.port.ready');
      }
    }
  }

  /**
   * Is known port sender
   * @param worker
   * @param sender
   * @returns {Promise<boolean>}
   */
  async isKnownPortSender(worker, sender) {
    if (worker.frameId === null) {
      worker.frameId = sender.frameId;
      await WorkersSessionStorage.updateWorker(new WorkerEntity(worker));
    }
    return worker.tabId === sender.tab.id && worker.frameId === sender.frameId;
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
   * @param id the id
   * @returns <void>
   */
  removePort(id) {
    this._ports[id]?.disconnect();
    delete this._ports[id];
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
   * @param {integer} tabId The tab id
   * @returns {Promise<void>}
   */
  async onTabRemoved(tabId) {
    if (typeof tabId === "undefined") {
      throw new Error("A tab identifier is required.");
    }
    if (!Number.isInteger(tabId)) {
      throw new Error("The tab identifier should be a valid integer.");
    }
    const workers = await WorkersSessionStorage.getWorkersByTabId(tabId);
    workers.forEach(worker => this.removePort(worker.id));
    await WorkersSessionStorage.delete(tabId);
  }
}

export default new PortManager();
