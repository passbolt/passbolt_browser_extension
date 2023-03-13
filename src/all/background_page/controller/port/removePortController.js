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
import WorkersSessionStorage from "../../service/sessionStorage/workersSessionStorage";
import PortManager from "../../sdk/port/portManager";

const APPLICATION_ALLOWED = {
  "WebIntegration": ["InFormCallToAction", "InFormMenu"],
};

class RemovePortController {
  /**
   * Constructor
   * @param {Worker} worker
   */
  constructor(worker) {
    this.worker = worker;
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @return {Promise<void>}
   */
  async _exec(applicationName) {
    try {
      await this.exec(applicationName);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Check if the application name is a string and is allowed to disconnect another application.
   * Remove worker and Disconnect the port.
   *
   * @return {Promise<void>}
   */
  async exec(applicationName) {
    if (typeof applicationName !== "string") {
      throw new Error("The application name should be a string");
    }
    if (!this.isAllowedToRemovePort(this.worker.name, applicationName)) {
      throw new Error(`The application is not allowed to close the application ${applicationName}`);
    }

    const tab = this.worker.tab;
    const workers = await WorkersSessionStorage.getWorkersByNameAndTabId(applicationName, tab.id);

    // If one worker don't need to do some checks before to remove the port
    if (workers.length === 1) {
      const workerId = workers[0].id;
      // Remove the port
      PortManager.removePort(workerId, {reason: "disconnected"});
      // Remove the reference in the session storage
      await WorkersSessionStorage.deleteById(workerId);
    } else if (workers.length > 1) {
      // Check which port is already disconnected to remove it
      await Promise.all(workers.map(worker => this.removePortReference(worker.id)));
    }
  }

  /**
   * Is allowed to remove port
   * @param {string} workerName
   * @param {string} applicationName
   * @returns {Boolean}
   */
  isAllowedToRemovePort(workerName, applicationName) {
    return APPLICATION_ALLOWED[workerName]?.includes(applicationName);
  }

  /**
   * Remove the port reference
   * @param {string} portId The port id
   * @return {Promise<void>}
   */
  async removePortReference(portId) {
    if (PortManager.isPortExist(portId)) {
      const port = PortManager.getPortById(portId);
      try {
        // If the port is still connected do nothing
        port.emit('passbolt.port.check');
      } catch (error) {
        console.debug('The port is not connected, remove references');
        PortManager.removePort(portId, {reason: "disconnected"});
        await WorkersSessionStorage.deleteById(portId);
      }
    } else {
      await WorkersSessionStorage.deleteById(portId);
    }
  }
}

export default RemovePortController;
