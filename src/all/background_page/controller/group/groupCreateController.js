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
 * @since         5.11.0
 */
import CreateGroupService from "../../service/group/createGroupService";
import GroupEntity from "../../model/entity/group/groupEntity";

class GroupCreateController {
  /**
   * GroupCreateController constructor
   *
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions the api client options
   * @param {AccountEntity} account The account associated to the worker.
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.createGroupService = new CreateGroupService(apiClientOptions, account);
  }

  /**
   * Controller executor.
   * @param {object} groupDto The group data
   * @returns {Promise<void>}
   */
  async _exec(groupDto) {
    try {
      const group = await this.exec(groupDto);
      this.worker.port.emit(this.requestId, "SUCCESS", group);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Create a group.
   * @param {object} groupDto The group data
   * @returns {Promise<GroupEntity>}
   */
  async exec(groupDto) {
    const groupEntity = new GroupEntity(groupDto);
    return this.createGroupService.create(groupEntity);
  }
}

export default GroupCreateController;
