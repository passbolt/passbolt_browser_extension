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
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import UpdateResourceTypesService from "../../service/resourceType/updateResourceTypesService";

export default class UpdateAllResourceTypesDeletedStatusController {
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
    this.updateResourceTypesService = new UpdateResourceTypesService(apiClientOptions);
  }

  /**
   * Controller executor.
   * @returns {Promise<void>}
   */
  async _exec() {
    try {
      await this.exec.apply(this, arguments);
      this.worker.port.emit(this.requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Updates the deletion status of all the given resource types.
   * @param {Array} resourceTypesCollectionDto
   * @returns {Promise<void>}
   */
  async exec(resourceTypesCollectionDto) {
    const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionDto);
    await this.updateResourceTypesService.updateAllDeletedStatus(resourceTypesCollection);
  }
}
