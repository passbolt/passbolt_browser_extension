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
import GetOrFindGroupsUsersService from "../../service/group/getOrFindGroupsUsersService";
import { assertUuid } from "../../utils/assertions";

/**
 * Controller for the `passbolt.groups_users.get-by-group-id` event. Returns the members of the group
 * matching the given id, served from the local storage cache when available and otherwise fetched
 * from the API.
 */
class GetOrFindGroupsUsersController {
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
    this.getOrFindGroupsUsersService = new GetOrFindGroupsUsersService(account, apiClientOptions);
  }

  /**
   * Controller executor.
   * @param {string} groupId The id of the group whose members are requested.
   * @returns {Promise<void>}
   */
  async _exec(groupId) {
    try {
      const result = await this.exec(groupId);
      this.worker.port.emit(this.requestId, "SUCCESS", result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Find all the members of the group matching the given id.
   * @param {string} groupId The id of the group whose members are requested.
   * @returns {Promise<GroupsUsersCollection>}
   */
  async exec(groupId) {
    assertUuid(groupId);
    return this.getOrFindGroupsUsersService.getOrFindByGroupId(groupId);
  }
}

export default GetOrFindGroupsUsersController;
