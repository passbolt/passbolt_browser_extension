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

import GroupsCollection from "../../model/entity/group/groupsCollection";
import {assertBoolean, assertType} from "../../utils/assertions";
import GroupApiService from "../api/group/groupApiService";
import User from "../../model/user";

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
   * @param {Object|null} [orders] optional
   * @param {boolean?} [ignoreInvalidEntity] Should invalid entities be ignored.
   * @returns {Promise<GroupsCollection>}
   */
  async findAll(contains, filters, orders, ignoreInvalidEntity) {
    if (contains) {
      assertType(contains, Object);
    }
    if (filters) {
      assertType(filters, Object);
    }
    if (orders) {
      assertType(orders, Object);
    }
    assertBoolean(ignoreInvalidEntity);
    const groupsDto = await this.groupApiService.findAll(contains, filters, orders);
    return new GroupsCollection(groupsDto, {clone: false, ignoreInvalidEntity: ignoreInvalidEntity});
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
    const contains = {groups_users: true, my_group_user: true, modifier: false};
    return await this.findAll(contains, null, null, true);
  }
}
