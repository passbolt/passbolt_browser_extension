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
import Entity from "../abstract/entity";
import EntitySchema from "../abstract/entitySchema";

const ENTITY_NAME = 'Role';
const ROLE_ADMIN = 'admin';
const ROLE_USER = 'user';
const ROLE_GUEST = 'guest';
const ROLE_ROOT = 'root';
const ROLE_NAME_MAX_LENGTH = 255;

class RoleEntity extends Entity {
  /**
   * Role entity constructor
   *
   * @param {Object} roleDto role DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(roleDto) {
    super(EntitySchema.validate(
      RoleEntity.ENTITY_NAME,
      roleDto,
      RoleEntity.getSchema()
    ));
  }

  /**
   * Get role entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "id",
        "name",
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "name": {
          "type": "string",
          "enum": [RoleEntity.ROLE_ADMIN, RoleEntity.ROLE_USER, RoleEntity.ROLE_GUEST, RoleEntity.ROLE_ROOT]
        },
        "description": {
          "type": "string",
          "maxLength": ROLE_NAME_MAX_LENGTH
        },
        "created": {
          "type": "string",
          "format": "date-time"
        },
        "modified": {
          "type": "string",
          "format": "date-time"
        },
      }
    };
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */
  /**
   * Get role id
   * @returns {string} uuid
   */
  get id() {
    return this._props.id;
  }

  /**
   * Get role name
   * @returns {string} admin or user
   */
  get name() {
    return this._props.name;
  }

  /**
   * Get role description
   * @returns {(string|null)} description
   */
  get description() {
    return this._props.description || null;
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

  /*
   * ==================================================
   * Dynamic helper
   * ==================================================
   */
  /**
   * Check if the role correspond to the admin role.
   * @returns {boolean}
   */
  isAdmin() {
    return this.name === RoleEntity.ROLE_ADMIN;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * RoleEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * RoleEntity.ROLE_ADMIN
   * @returns {string} admin
   */
  static get ROLE_ADMIN() {
    return ROLE_ADMIN;
  }

  /**
   * RoleEntity.ROLE_USER
   * @returns {string} user
   */
  static get ROLE_USER() {
    return ROLE_USER;
  }

  /**
   * RoleEntity.ROLE_GUEST
   * @returns {string} user
   */
  static get ROLE_GUEST() {
    return ROLE_GUEST;
  }

  /**
   * RoleEntity.ROLE_ROOT
   * @returns {string} user
   */
  static get ROLE_ROOT() {
    return ROLE_ROOT;
  }
}

export default RoleEntity;
