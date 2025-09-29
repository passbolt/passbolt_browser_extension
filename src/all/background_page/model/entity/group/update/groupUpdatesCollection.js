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
 * @since         5.6.0
 */
import EntityV2Collection from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2Collection";
import GroupUpdateEntity from "./groupUpdateEntity";
import GroupUserChangeEntity from "../../groupUser/change/groupUserChangeEntity";
import {assertType} from "../../../../utils/assertions";

export default class GroupUpdatesCollection extends EntityV2Collection {
  /**
   * @inheritDoc
   */
  get entityClass() {
    return GroupUpdateEntity;
  }

  /**
   * Creates a GroupUpdatesCollection from a GroupUpdateEntity.
   * Each collection items is actually a single group update operation to run on the API.
   *
   * Items are ordered this way:
   *  - group name update first
   *  - group member additions second
   *  - group member role update third
   *  - group member removal last
   *
   * The update operations order is important and is made to keep integrity and avoid errors like
   *   deleting the last group manager before adding a new one for instance.
   *
   * @param {GroupUpdateEntity} groupUpdateEntity
   * @returns {GroupUpdatesCollection}
   */
  static createFromGroupUpdateEntity(groupUpdateEntity) {
    assertType(groupUpdateEntity, GroupUpdateEntity);

    const {id, name} = groupUpdateEntity;
    const allUsersSecrets = groupUpdateEntity.secrets?.toDto() || [];
    const groupsUsers = groupUpdateEntity.groupsUsers;

    const addMemeberOperationsDto = [];
    const updateMemeberRoleOperationsDto = [];
    const deleteMemeberOperationsDto = [];

    for (let i = 0; i < groupsUsers.items.length; i++) {
      const groupUserChangeEntity = groupsUsers.items[i];
      const groups_users = [groupUserChangeEntity.toDto()];
      const singleGoupUserUpdateChangeDto = {id, name, groups_users};

      switch (groupUserChangeEntity.scenario) {
        case (GroupUserChangeEntity.GROUP_USER_CHANGE_CREATE): {
          const secrets = allUsersSecrets
            .filter(s => s.user_id === groupUserChangeEntity.userId);

          singleGoupUserUpdateChangeDto.secrets = secrets;
          addMemeberOperationsDto.push(singleGoupUserUpdateChangeDto);
          break;
        }

        case (GroupUserChangeEntity.GROUP_USER_CHANGE_UPDATE): {
          updateMemeberRoleOperationsDto.push(singleGoupUserUpdateChangeDto);
          break;
        }

        case (GroupUserChangeEntity.GROUP_USER_CHANGE_DELETE): {
          deleteMemeberOperationsDto.push(singleGoupUserUpdateChangeDto);
          break;
        }

        default: {
          throw new Error("Unsupported Group user membership update operation type.");
        }
      }
    }

    const groupNameUpdateOperationDto = {id, name};
    return new GroupUpdatesCollection([
      groupNameUpdateOperationDto,
      ...addMemeberOperationsDto,
      ...updateMemeberRoleOperationsDto,
      ...deleteMemeberOperationsDto
    ]);
  }

  /*
   * ==================================================
   * Validation
   * ==================================================
   */

  /**
   * Get resources entity schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": GroupUpdateEntity.getSchema(),
    };
  }
}
