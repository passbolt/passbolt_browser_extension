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
 * @since         4.9.4
 */
import {assertArrayUUID} from "../../utils/assertions";
import FindResourcesService from "../../service/resource/findResourcesService";

class FindResourcesForShareController {
  /**
   * Constructor.
   * @param {Worker} worker The associated worker.
   * @param {string} requestId The associated request id.
   * @param {ApiClientOptions} apiClientOptions The api client options.
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.findResourcesService = new FindResourcesService(account, apiClientOptions);
  }

  /**
   * Controller executor.
   * @param {Array<uuid>} resourceIds The resources ids
   * @returns {Promise<void>}
   */
  async _exec(resourceIds) {
    try {
      const result = await this.exec(resourceIds);
      this.worker.port.emit(this.requestId, 'SUCCESS', result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Find the resource to share.
   * @param {Array<uuid>} resourceIds The resources ids
   * @returns {Promise<ResourcesCollection>}
   */
  async exec(resourceIds) {
    assertArrayUUID(resourceIds);

    return this.findResourcesService.findAllByIdsForShare(resourceIds);
  }
}

export default FindResourcesForShareController;
