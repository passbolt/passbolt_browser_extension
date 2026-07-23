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
 * @since         5.14.0
 */
import FindResourcesService from "../../service/resource/findResourcesService";
import { assertArrayUUID } from "../../utils/assertions";

/**
 * Controller for the `passbolt.permissions.find-by-ids-for-share` event.
 * Returns the given resources with the permissions data tailored for the share process, fetched
 * from the API in a single batched query (no metadata decryption, no passphrase prompt).
 */
class FindPermissionsByIdsForShareController {
  /**
   * Constructor.
   * @param {Worker} worker The associated worker.
   * @param {string} requestId The associated request id.
   * @param {ApiClientOptions} apiClientOptions The api client options.
   * @param {AccountEntity} account The user account.
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.findResourcesService = new FindResourcesService(account, apiClientOptions);
  }

  /**
   * Controller executor.
   * @param {Array<string>} resourcesIds The ids of the resources to retrieve.
   * @returns {Promise<void>}
   */
  async _exec(resourcesIds) {
    try {
      const result = await this.exec(resourcesIds);
      this.worker.port.emit(this.requestId, "SUCCESS", result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Find the permissions of the given resources for the share process.
   * @param {Array<string>} resourcesIds The ids of the resources to retrieve.
   * @returns {Promise<ResourcesCollection>}
   */
  async exec(resourcesIds) {
    assertArrayUUID(resourcesIds);
    return this.findResourcesService.findAllPermissionsByIdsForShare(resourcesIds);
  }
}

export default FindPermissionsByIdsForShareController;
