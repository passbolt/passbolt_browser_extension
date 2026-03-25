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

import GroupApiService from "../api/group/groupApiService";
import GroupLocalStorage from "../local_storage/groupLocalStorage";
import GroupEntity from "../../model/entity/group/groupEntity";
import { assertType } from "../../utils/assertions";

export default class CreateGroupService {
  /**
   *
   * @param {ApiClientOptions} apiClientOptions
   * @param {AccountEntity} account
   * @public
   */
  constructor(apiClientOptions, account) {
    this.groupApiService = new GroupApiService(apiClientOptions);
    this.groupLocalStorage = new GroupLocalStorage(account);
  }

  /**
   * Create a group using create API and add the result to the local storage.
   *
   * @param {GroupEntity} groupEntity The group entity to create
   * @returns {Promise<GroupEntity>}
   * @public
   */
  async create(groupEntity) {
    assertType(groupEntity, GroupEntity, "The parameter 'groupEntity' should be a GroupEntity");

    const data = groupEntity.toDto({ groups_users: true });
    const createdGroupDto = await this.groupApiService.create(data, { groups_users: true, my_group_user: true });
    const createdGroupEntity = new GroupEntity(createdGroupDto);
    await this.groupLocalStorage.addGroup(createdGroupEntity);
    return createdGroupEntity;
  }
}
