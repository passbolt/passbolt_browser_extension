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
import GroupEntity from "../../group/groupEntity";
import PermissionEntity from "../permissionEntity";
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import LoggedUserEntity from "../../user/actionLog/loggedUserEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'UpdatedPermission';

class UpdatedPermissionEntity extends Entity {
  /**
   * Updated permission entity constructor
   *
   * @param {Object} updatedPermission Updated Permission DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(updatedPermission) {
    super(EntitySchema.validate(
      UpdatedPermissionEntity.ENTITY_NAME,
      updatedPermission,
      UpdatedPermissionEntity.getSchema()
    ));

    // Associations
    if (this._props.user) {
      this._user = new LoggedUserEntity(this._props.user);
      delete this._props.user;
    }
    if (this._props.group) {
      this._group = new GroupEntity(this._props.group);
      delete this._props.group;
    }
  }

  /**
   * Get user entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "id",
        "type"
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "type": {
          "type": "integer",
          "enum": [
            PermissionEntity.PERMISSION_READ,
            PermissionEntity.PERMISSION_UPDATE,
            PermissionEntity.PERMISSION_OWNER
          ]
        },
        // Associated models
        "user": LoggedUserEntity.getSchema(),
        "group": GroupEntity.getSchema()
      }
    };
  }

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

    if (this.user && contain.user) {
      if (contain.user === true) {
        result.user = this.user.toDto();
      } else {
        result.user = this.user.toDto(contain.user);
      }
    }

    if (this.group && contain.group) {
      if (contain.group === true) {
        result.group = this.group.toDto();
      } else {
        result.group = this.group.toDto(contain.group);
      }
    }

    return result;
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto(UpdatedPermissionEntity.ALL_CONTAIN_OPTIONS);
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */
  /**
   * Get id
   * @returns {(string|null)} uuid
   */
  get id() {
    return this._props.id || null;
  }

  /**
   * Get type
   * @returns {string} email
   */
  get type() {
    return this._props.type;
  }

  /*
   * ==================================================
   * Other associated properties methods
   * ==================================================
   */

  /**
   * Get the user.
   * @returns {(LoggedUserEntity|null)}
   */
  get user() {
    return this._user || null;
  }

  /**
   * Get the group.
   * @returns {(GroupEntity|null)}
   */
  get group() {
    return this._group || null;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */

  /**
   * UpdatedPermissionEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * UpdatedPermissionEntity.ALL_CONTAIN_OPTIONS
   * @returns {object} all contain options that can be used in toDto()
   */
  static get ALL_CONTAIN_OPTIONS() {
    return PermissionEntity.ALL_CONTAIN_OPTIONS;
  }
}

export default UpdatedPermissionEntity;
