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
import GetOrFindUsersService from "../../service/user/getOrFindUsersService";
import { assertArrayUUID } from "../../utils/assertions";

/**
 * Controller for the `passbolt.users.get-by-ids` event. Returns the users matching the given ids,
 * served from the local storage cache when available and otherwise fetched from the API.
 */
class GetOrFindUsersController {
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
    this.getOrFindUsersService = new GetOrFindUsersService(account, apiClientOptions);
  }

  /**
   * Controller executor.
   * @param {Array<string>} userIds The ids of the users to retrieve.
   * @returns {Promise<void>}
   */
  async _exec(userIds) {
    try {
      const result = await this.exec(userIds);
      this.worker.port.emit(this.requestId, "SUCCESS", result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Find all the users matching the given ids.
   * @param {Array<string>} userIds The ids of the users to retrieve.
   * @returns {Promise<UsersCollection>}
   */
  async exec(userIds) {
    assertArrayUUID(userIds);
    return this.getOrFindUsersService.getOrFindByIds(userIds);
  }
}

export default GetOrFindUsersController;
