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
 * @since         2.13.0
 */
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import GroupUserEntity from "../groupUser/groupUserEntity";
import GroupsUsersCollection from "../groupUser/groupsUsersCollection";
import UserEntity from "../user/userEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'Group';
const GROUP_NAME_MIN_LENGTH = 1;
const GROUP_NAME_MAX_LENGTH = 255;

class GroupEntity extends Entity {
  /**
   * Group entity constructor
   *
   * @param {Object} groupDto group DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(groupDto) {
    super(EntitySchema.validate(
      GroupEntity.ENTITY_NAME,
      groupDto,
      GroupEntity.getSchema()
    ));

    // Association
    if (this._props.groups_users) {
      this._groups_users = new GroupsUsersCollection(this._props.groups_users);
      delete this._props.groups_users;
    }
    if (this._props.my_group_user) {
      this._my_group_user = new GroupUserEntity(this._props.my_group_user);
      delete this._props.my_group_user;
    }
    if (this._props.creator) {
      this._creator = new UserEntity(this._props.creator);
      delete this._props.creator;
    }
    if (this._props.modifier) {
      this._modifier = new UserEntity(this._props.modifier);
      delete this._props.modifier;
    }
  }

  /**
   * Get group entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "name"
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "name": {
          "type": "string",
          "minLength": GROUP_NAME_MIN_LENGTH,
          "maxLength": GROUP_NAME_MAX_LENGTH
        },
        "deleted": {
          "type": "boolean"
        },
        "created": {
          "type": "string",
          "format": "date-time"
        },
        "modified": {
          "type": "string",
          "format": "date-time"
        },
        "created_by": {
          "type": "string",
          "format": "uuid"
        },
        "modified_by": {
          "type": "string",
          "format": "uuid"
        },
        // Associations
        "groups_users": GroupsUsersCollection.getSchema(),
        "my_group_user": GroupUserEntity.getSchema(),
        "creator": UserEntity.getSchema(),
        "modifier": UserEntity.getSchema()
      }
    };
  }

  /*
   * ==================================================
   * Sanitization
   * ==================================================
   */
  /**
   * Sanitize group dto:
   * - Remove group users which don't validate if any.
   *
   * @param {object} dto the group dto
   * @returns {object}
   */
  static sanitizeDto(dto) {
    if (typeof dto !== "object") {
      return dto;
    }

    if (Object.prototype.hasOwnProperty.call(dto, 'groups_users')) {
      dto.groups_users = GroupsUsersCollection.sanitizeDto(dto.groups_users);
    }

    return dto;
  }

  /*
   * ==================================================
   * Serialization
   * ==================================================
   */
  /**
   * Return a DTO ready to be sent to API
   * @param {object} [contain] optional for example {profile: {avatar:true}}
   * @returns {*}
   */
  toDto(contain) {
    const result = Object.assign({}, this._props);
    if (!contain) {
      return result;
    }
    if (this._groups_users && contain.groups_users) {
      if (contain.groups_users === true) {
        result.groups_users = this._groups_users.toDto();
      } else {
        result.groups_users = this._groups_users.toDto(contain.groups_users);
      }
    }
    if (this._my_group_user && contain.my_group_user) {
      result.my_group_user = this._my_group_user.toDto();
    }
    if (this._creator && contain.creator) {
      if (contain.creator === true) {
        result.creator = this._creator.toDto();
      } else {
        result.creator = this._creator.toDto(contain.user);
      }
    }
    if (this._modifier && contain.modifier) {
      if (contain.modifier === true) {
        result.modifier = this._modifier.toDto();
      } else {
        result.modifier = this._modifier.toDto(contain.modifier);
      }
    }
    return result;
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto(GroupEntity.ALL_CONTAIN_OPTIONS);
  }

  /**
   * GroupEntity.ALL_CONTAIN_OPTIONS
   * @returns {object} all contain options that can be used in toDto()
   */
  static get ALL_CONTAIN_OPTIONS() {
    return {
      'creator': UserEntity.ALL_CONTAIN_OPTIONS,
      'modifier': UserEntity.ALL_CONTAIN_OPTIONS,
      'groups_users': GroupUserEntity.ALL_CONTAIN_OPTIONS,
      'my_group_user': GroupUserEntity.ALL_CONTAIN_OPTIONS,
    };
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */
  /**
   * Get group id
   * @returns {(string|null)} uuid
   */
  get id() {
    return this._props.id || null;
  }

  /**
   * Get group name
   * @returns {string} admin or user
   */
  get name() {
    return this._props.name;
  }

  /**
   * Get deleted flag info
   * @returns {(boolean|null)} true if deleted
   */
  get isDeleted() {
    if (typeof this._props.deleted === 'undefined') {
      return null;
    }
    return this._props.deleted;
  }

  /**
   * Get created date
   * @returns {(string|null)} date
   */
  get created() {
    return this._props.created || null;
  }

  /**
   * Get modified date
   * @returns {(string|null)} date
   */
  get modified() {
    return this._props.modified || null;
  }

  /**
   * Get created by user id
   * @returns {(string|null)} uuid
   */
  get createdBy() {
    return this._props.created_by || null;
  }

  /**
   * Get modified by user id
   * @returns {(string|null)} date
   */
  get modifiedBy() {
    return this._props.modified_by || null;
  }

  /**
   * Return groups users
   * @returns {(GroupsUsersCollection|null)}
   */
  get groupsUsers() {
    return this._groups_users || null;
  }

  /**
   * Return current user group user
   * @todo is it still used? Consider for removal
   * @returns {(GroupUserEntity|null)}
   */
  get myGroupUser() {
    return this._my_group_user || null;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * GroupEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default GroupEntity;
