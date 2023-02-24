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

import {v4 as uuidv4} from "uuid";
import WorkersSessionStorage from "../../../../chrome-mv3/service/sessionStorage/workersSessionStorage";
import WorkerEntity from "../../model/entity/worker/workerEntity";
import browser from "../../sdk/polyfill/browserPolyfill";

const APPLICATION_ALLOWED = {
  "RecoverBootstrap": ["Recover"],
  "SetupBootstrap": ["Setup"],
  "AuthBootstrap": ["Auth"],
  "AppBootstrap": ["App"],
  "AccountRecoveryBootstrap": ["AccountRecovery"],
  "WebIntegration": ["InFormCallToAction", "InFormMenu"],
};

class GeneratePortIdController {
  /**
   * Constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   */
  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @return {Promise<void>}
   */
  async _exec(applicationName) {
    try {
      const result = await this.exec(applicationName);
      this.worker.port.emit(this.requestId, "SUCCESS", result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Check if the application name is a string and is allowed to open another application.
   * For MV2: return the port name
   * For MV3: Add worker and generate the port id.
   *
   * @return {Promise<string>}
   */
  async exec(applicationName) {
    if (typeof applicationName !== "string") {
      throw new Error("The application name should be a string");
    }
    if (!this.isAllowedToGeneratePortId(this.worker, applicationName)) {
      throw new Error(`The application is not allowed to open the application ${applicationName}`);
    }
    // @deprecated The support of MV2 will be down soon
    if (this.isManifestV2) {
      return `passbolt-iframe-${applicationName.toLowerCase()}`;
    } else {
      const tab = this.worker.tab;
      const worker = {
        id: uuidv4(),
        name: applicationName,
        tabId: tab.id,
        frameId: null
      };
      await WorkersSessionStorage.addWorker(new WorkerEntity(worker));
      return worker.id;
    }
  }

  /**
   * Is allowed to generate port id
   * @param {*} worker
   * @param {string} applicationName
   * @returns {Boolean}
   */
  isAllowedToGeneratePortId(worker, applicationName) {
    const workerName = worker.name || worker.pageMod.args.name;
    return APPLICATION_ALLOWED[workerName]?.includes(applicationName);
  }

  /**
   * Is manifest v2
   * @returns {boolean}
   */
  get isManifestV2() {
    return browser.runtime.getManifest().manifest_version === 2;
  }
}

export default GeneratePortIdController;