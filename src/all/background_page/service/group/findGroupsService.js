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
 * @since         5.7.0
 */

import GroupsCollection from "passbolt-styleguide/src/shared/models/entity/group/groupsCollection";
import { assertArrayUUID, assertBoolean, assertType } from "../../utils/assertions";
import GroupApiService from "../api/group/groupApiService";
import User from "../../model/user";
import ExecuteConcurrentlyService from "../execute/executeConcurrentlyService";

export default class FindGroupsService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.groupApiService = new GroupApiService(apiClientOptions);
  }

  /**
   * Find all groups
   *
   * @param {Object|null} [contains] optional
   * @param {Object|null} [filters] optional
   * @param {boolean?} [ignoreInvalidEntity] Should invalid entities be ignored.
   * @returns {Promise<GroupsCollection>}
   */
  async findAll(contains, filters, ignoreInvalidEntity) {
    if (contains) {
      assertType(contains, Object);
    }
    if (filters) {
      assertType(filters, Object);
    }
    assertBoolean(ignoreInvalidEntity);
    const response = await this.groupApiService.findAll(contains, filters);
    return new GroupsCollection(response.body ?? [], { clone: false, ignoreInvalidEntity: ignoreInvalidEntity });
  }

  /**
   * Find all groups that belongs to user
   *
   * @returns {Promise<GroupsCollection>}
   */
  async findMyGroups() {
    const userId = User.getInstance().get().id;
    const filters = {
      "has-users": userId,
    };
    return await this.findAll(null, filters);
  }

  /**
   * Find all filtered for local storage
   *
   * @returns {Promise<GroupsCollection>}
   */
  async findAllForLocalStorage() {
    const contains = { groups_users: true, my_group_user: true, modifier: false };
    return await this.findAll(contains, null, true);
  }

  /**
   * Find all groups given their ids with the data tailored for the "Share" process.
   * @param {Array<string>} groupIds
   */
  async findAllByIdsForShare(groupIds) {
    assertArrayUUID(groupIds);

    const contains = { groups_users: true, my_group_user: false, modifier: false };
    return await this.findAllByIds(groupIds, contains);
  }

  /**
   * Find all groups given their ids.
   * @param {Array<string>} groupIds
   * @param {Object|null} [contains] optional
   */
  async findAllByIds(groupIds, contains) {
    assertArrayUUID(groupIds);

    // @todo: update to check for server capability for supporting `has-id` filter and use it instead.
    const callbacks = groupIds.map((groupId) => {
      return async () => {
        const response = await this.groupApiService.get(groupId, contains);
        return new GroupsCollection(response.body);
      };
    });

    // @todo Later (tm). The Collection should provide this capability, ensuring that validation build rules are executed and performance is guaranteed.
    const executeConcurrentlyService = new ExecuteConcurrentlyService();
    const arrayOfCollection = await executeConcurrentlyService.execute(callbacks, 5);
    const groupsCollection = new GroupsCollection();

    arrayOfCollection.forEach((collection) => {
      groupsCollection.pushMany(collection.items, { validate: false, ignoreInvalidEntity: true });
    });

    return groupsCollection;
  }
}
