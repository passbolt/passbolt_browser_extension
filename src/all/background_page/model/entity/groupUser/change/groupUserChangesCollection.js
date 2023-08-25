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
 */
import EntityCollection from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollection";
import GroupsUsersCollection from "../groupsUsersCollection";
import GroupUserChangeEntity from "./groupUserChangeEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'GroupUserChanges';

class GroupUserChangesCollection extends EntityCollection {
  /**
   * PermissionChanges Entity constructor
   *
   * @param {array} groupUserChangesDto group user changes DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(groupUserChangesDto) {
    super(EntitySchema.validate(
      GroupUserChangesCollection.ENTITY_NAME,
      groupUserChangesDto,
      GroupUserChangesCollection.getSchema()
    ));

    /*
     * Note: there is no "multi-item" validation
     * Collection validation will fail at the first item that doesn't validate
     */
    this._props.forEach(groupUserChange => {
      this.push(groupUserChange);
    });

    // We do not keep original props
    this._props = null;
  }

  /**
   * Get collection entity schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": GroupUserChangeEntity.getSchema(),
    };
  }

  /**
   * Build changes needed to go from one groups users collection to the other
   *
   * @param {GroupsUsersCollection} originalSet The original set of groups users
   * @param {GroupsUsersCollection} expectedSet The expected set of groups users
   */
  static createFromGroupsUsersCollectionsChanges(originalSet, expectedSet) {
    if (!originalSet || !(originalSet instanceof GroupsUsersCollection) || !expectedSet || !(expectedSet instanceof GroupsUsersCollection)) {
      throw new TypeError('GroupUserChangesCollection createFromGroupsUsersCollectionsChanges invalid parameters');
    }
    const result = new GroupUserChangesCollection([]);

    // Find new or updated group user
    for (const updatedGroupUser of expectedSet) {
      const groupUser = originalSet.getGroupUserByUserId(updatedGroupUser.userId);
      if (!groupUser) {
        const newChange = GroupUserChangeEntity.createFromGroupUser(updatedGroupUser, GroupUserChangeEntity.GROUP_USER_CHANGE_CREATE);
        result.push(newChange);
      } else {
        if (updatedGroupUser.isAdmin !== groupUser.isAdmin) {
          updatedGroupUser.id = groupUser.id;
          const newChange = GroupUserChangeEntity.createFromGroupUser(updatedGroupUser, GroupUserChangeEntity.GROUP_USER_CHANGE_UPDATE);
          result.push(newChange);
        }
      }
    }

    // Find deleted groups users
    for (const originalGroupUser of originalSet) {
      if (!expectedSet.getById(originalGroupUser.id)) {
        const newChange = GroupUserChangeEntity.createFromGroupUser(originalGroupUser, GroupUserChangeEntity.GROUP_USER_CHANGE_DELETE);
        result.push(newChange);
      }
    }

    return result;
  }

  /*
   * ==================================================
   * Setters
   * ==================================================
   */

  /**
   * Push a copy of the group user change to the list
   * @param {GroupUserChangeEntity} groupUserChange DTO or GroupUserChangeEntity
   */
  push(groupUserChange) {
    if (!groupUserChange || typeof groupUserChange !== 'object') {
      throw new TypeError(`GroupUserChangesCollection push parameter should be an object.`);
    }
    if (groupUserChange instanceof GroupUserChangeEntity) {
      groupUserChange = groupUserChange.toDto(); // clone
    }
    groupUserChange = new GroupUserChangeEntity(groupUserChange); // validate
    super.push(groupUserChange);
  }

  /*
   * ==================================================
   * Static getters
   * ==================================================
   */

  /**
   * ActionLogsCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default GroupUserChangesCollection;
