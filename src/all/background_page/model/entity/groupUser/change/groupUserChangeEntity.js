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
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import GroupUserEntity from "../groupUserEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'GroupUser';
const GROUP_USER_CHANGE_CREATE = 'create';
const GROUP_USER_CHANGE_DELETE = 'delete';
const GROUP_USER_CHANGE_UPDATE = 'update';

class GroupUserChangeEntity extends Entity {
  /**
   * GroupUserChange entity constructor
   *
   * @param {Object} groupUserChangesDto data transfer object
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(groupUserChangesDto) {
    super(EntitySchema.validate(
      GroupUserChangeEntity.ENTITY_NAME,
      groupUserChangesDto,
      GroupUserChangeEntity.getSchema()
    ));
  }

  /**
   * A group user change is basically a GroupUser entity
   * Without the dates, without the associated data like user etc.
   * With additional deleted fields (boolean flags)
   */
  static getSchema() {
    const schema = GroupUserEntity.getSchema();
    const whitelistProps = ["id", "user_id", "is_admin"];
    const extendedSchema = {
      "type": "object",
      "required": [],
      "properties": {
        "delete": {
          "type": "boolean",
        }
      }
    };

    whitelistProps.forEach(prop => {
      extendedSchema.properties[prop] = schema.properties[prop];
    });

    return extendedSchema;
  }

  /**
   * Build a PermissionChangeEntity from a given permission and build case
   *
   * @param {GroupUserEntity} groupUser The base group user
   * @param {string} operation create, update, delete
   * @throws {TypeError} if parameters are not valid
   * @return {GroupUserChangeEntity}
   */
  static createFromGroupUser(groupUser, operation) {
    if (!groupUser || !(groupUser instanceof GroupUserEntity)) {
      throw new TypeError('GroupUserChangeEntity createFromGroupUser expect a GroupUser entity.');
    }
    const changeDto = {};
    switch (operation) {
      case GroupUserChangeEntity.GROUP_USER_CHANGE_CREATE:
        if (!groupUser.userId) {
          throw new TypeError('GroupUserChangeEntity createFromGroupUser update expect a group user user_id.');
        }
        changeDto.user_id = groupUser.userId;
        changeDto.is_admin = groupUser.isAdmin;
        // nothing to do
        break;
      case GroupUserChangeEntity.GROUP_USER_CHANGE_UPDATE:
        if (!groupUser.id) {
          throw new TypeError('GroupUserChangeEntity createFromGroupUser update expect a group user id.');
        }
        changeDto.id = groupUser.id;
        changeDto.is_admin = groupUser.isAdmin;
        break;
      case GroupUserChangeEntity.GROUP_USER_CHANGE_DELETE:
        if (!groupUser.id) {
          throw new TypeError('GroupUserChangeEntity createFromGroupUser delete expect a group user id.');
        }
        changeDto.id = groupUser.id;
        changeDto.delete = true;
        break;
      default:
        throw new TypeError('GroupUserChangeEntity createFromGroupUser unsupported operation');
    }

    return new GroupUserChangeEntity(changeDto);
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */

  /**
   * Get group user id
   * @returns {(string|null)} uuid if set
   */
  get id() {
    return this._props.id || null;
  }

  /**
   * Get user id
   * @returns {string} uuid
   */
  get userId() {
    return this._props.user_id || null;
  }

  /**
   * Get the is admin flag
   * @returns {boolean}
   */
  get isAdmin() {
    return this._props.is_admin || null;
  }

  /**
   * Get deleted status flag
   * @returns {(boolean|null)} true if deleted
   */
  get isDeleted() {
    if (typeof this._props.delete === 'undefined') {
      return null;
    }
    return this._props.delete;
  }

  /**
   * Get the current change scenario
   * @returns {string}
   */
  get scenario() {
    if (this.isDeleted) {
      return GroupUserChangeEntity.GROUP_USER_CHANGE_DELETE;
    }
    if (!this.id) {
      return GroupUserChangeEntity.GROUP_USER_CHANGE_CREATE;
    }
    return GroupUserChangeEntity.GROUP_USER_CHANGE_UPDATE;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */

  /**
   * GroupUserChangeEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * GroupUserChangeEntity.PERMISSION_CHANGE_CREATE
   * @returns {string}
   */
  static get GROUP_USER_CHANGE_CREATE() {
    return GROUP_USER_CHANGE_CREATE;
  }

  /**
   * GroupUserChangeEntity.PERMISSION_CHANGE_UPDATE
   * @returns {string}
   */
  static get GROUP_USER_CHANGE_UPDATE() {
    return GROUP_USER_CHANGE_UPDATE;
  }

  /**
   * GroupUserChangeEntity.PERMISSION_CHANGE_DELETE
   * @returns {string}
   */
  static get GROUP_USER_CHANGE_DELETE() {
    return GROUP_USER_CHANGE_DELETE;
  }
}

export default GroupUserChangeEntity;
