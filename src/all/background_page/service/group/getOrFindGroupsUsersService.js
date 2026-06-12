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
import GroupsUsersCollection from "passbolt-styleguide/src/shared/models/entity/groupUser/groupsUsersCollection";
import GetOrFindGroupsService from "./getOrFindGroupsService";
import { assertUuid } from "../../utils/assertions";

/**
 * The service aims to retrieve the group members of a given group from the local storage cache
 * served by `GetOrFindGroupsService`, falling back to the API on a cold cache.
 */
class GetOrFindGroupsUsersService {
  /**
   * Constructor.
   * @param {AccountEntity} account The user account.
   * @param {ApiClientOptions} apiClientOptions The api client options.
   */
  constructor(account, apiClientOptions) {
    this.getOrFindGroupsService = new GetOrFindGroupsService(account, apiClientOptions);
  }

  /**
   * Get or find the members of the group matching the given id.
   * @param {string} groupId The id of the group whose members are requested.
   * @returns {Promise<GroupsUsersCollection>}
   * @throws {Error} If no group is found for the given id.
   */
  async getOrFindByGroupId(groupId) {
    assertUuid(groupId);

    const groupsCollection = await this.getOrFindGroupsService.getOrFindAll();
    const group = groupsCollection.getFirst("id", groupId);
    if (!group) {
      throw new Error(`The group with id ${groupId} could not be found.`);
    }

    return group.groupsUsers ?? new GroupsUsersCollection([]);
  }
}

export default GetOrFindGroupsUsersService;
