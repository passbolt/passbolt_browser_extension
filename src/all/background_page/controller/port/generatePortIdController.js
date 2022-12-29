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
  async _exec() {
    try {
      const result = await this.exec();
      this.worker.port.emit(this.requestId, "SUCCESS", result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Add worker and generate the port id.
   *
   * @return {Promise<string>}
   */
  async exec() {
    // @deprecated The support of MV2 will be down soon
    if (this.isManifestV2) {
      const applicationName = this.worker.pageMod.args.name.replace("Bootstrap", "");
      return `passbolt-iframe-${applicationName.toLowerCase()}`;
    } else {
      const tab = this.worker.tab;
      const worker = {
        id: uuidv4(),
        name: this.worker.name.replace("Bootstrap", ""),
        tabId: tab.id,
      };
      await WorkersSessionStorage.addWorker(new WorkerEntity(worker));
      return worker.id;
    }
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
