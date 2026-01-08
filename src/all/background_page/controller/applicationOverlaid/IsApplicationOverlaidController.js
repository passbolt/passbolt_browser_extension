/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         6.0.0
 */
import WorkerService from "../../service/worker/workerService";
import { assertUuid } from "../../utils/assertions";

/**
 * Controller related to check if application is overlaid (specific to inform manager)
 */
class IsApplicationOverlaidController {
  /**
   * InformCallToActionController constructor
   * @param {Worker} worker
   * @param {string} requestId
   */
  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
  }

  /**
   * Controller executor.
   * @param {string} applicationId The application id
   * @returns {Promise<void>}
   */
  async _exec(applicationId) {
    try {
      const result = await this.exec(applicationId);
      this.worker.port.emit(this.requestId, "SUCCESS", result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Check if the application is overlaid.
   * @param {string} applicationId
   * @returns {Promise<boolean>}
   */
  async exec(applicationId) {
    assertUuid(applicationId);
    const webIntegrationWorker = await WorkerService.get("WebIntegration", this.worker.tab.id);
    return webIntegrationWorker.port.request("passbolt.web-integration.is-application-overlaid", applicationId);
  }
}

export default IsApplicationOverlaidController;
