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
 * @since         5.13.0
 */
import GetOrFindGroupsService from "../../service/group/getOrFindGroupsService";
import { assertArrayUUID } from "../../utils/assertions";

/**
 * Controller for the `passbolt.groups.get-by-ids` event. Returns the groups matching the given ids,
 * served from the local storage cache when available and otherwise fetched from the API.
 */
class GetOrFindGroupsController {
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
    this.getOrFindGroupsService = new GetOrFindGroupsService(account, apiClientOptions);
  }

  /**
   * Controller executor.
   * @param {Array<string>} groupIds The ids of the groups to retrieve.
   * @returns {Promise<void>}
   */
  async _exec(groupIds) {
    try {
      const result = await this.exec(groupIds);
      this.worker.port.emit(this.requestId, "SUCCESS", result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Find all the groups matching the given ids.
   * @param {Array<string>} groupIds The ids of the groups to retrieve.
   * @returns {Promise<GroupsCollection>}
   */
  async exec(groupIds) {
    assertArrayUUID(groupIds);
    return this.getOrFindGroupsService.getOrFindByIds(groupIds);
  }
}

export default GetOrFindGroupsController;
