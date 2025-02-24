/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.12.0
 */
import ResourceTypeService from "../../service/api/resourceType/resourceTypeService";

class FindAllByDeletedAndNonDeletedResourceTypesContoller {
  /**
   * @constructor
   *
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions the api client options
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.resourceTypeService = new ResourceTypeService(apiClientOptions);
  }

  /**
   * Controller executor.
   * @returns {Promise<void>}
   */
  async _exec() {
    try {
      const resourceTypes = await this.exec();
      this.worker.port.emit(this.requestId, 'SUCCESS', resourceTypes);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Get or find resource types
   * @returns {Promise<ResourceTypesCollection>}
   */
  async exec() {
    return this.resourceTypeService.findAllByDeletedAndNonDeleted();
  }
}

export default FindAllByDeletedAndNonDeletedResourceTypesContoller;
