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
const {Entity} = require('../abstract/entity');
const {EntitySchema} = require('../abstract/entitySchema');
const {UserEntity} = require('../user/userEntity');
const {GroupEntity} = require('../group/groupEntity');

const ENTITY_NAME = 'Permission';
const PERMISSION_ADMIN = 15;
const PERMISSION_UPDATE = 5;
const PERMISSION_READ = 1;
const ARO_GROUP = 'Group';
const ARO_USER = 'User';
const ACO_RESOURCE = 'Resource';
const ACO_FOLDER = 'Folder';

class PermissionEntity extends Entity {
  /**
   * Permission Entity constructor
   *
   * @param {Object} permissionDto folder DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(permissionDto) {
    super(EntitySchema.validate(
      PermissionEntity.ENTITY_NAME,
      permissionDto,
      PermissionEntity.getSchema()
    ));

    // Associated models
    if (this._props.user) {
      this._user = new UserEntity(this._props.user);
      delete this._props.user;
    }
    if (this._props.group) {
      this._group = new GroupEntity(this._props.group);
      delete this._props.group;
    }
  }

  /**
   * Get permission entity schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "aco",
        "aro",
        "aco_foreign_key",
        "aro_foreign_key",
        "type"
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "aco": {
          "type": "string",
          "enum": [
            PermissionEntity.ACO_FOLDER,
            PermissionEntity.ACO_RESOURCE
          ]
        },
        "aco_foreign_key": {
          "type": "string",
          "format": "uuid"
        },
        "aro": {
          "type": "string",
          "enum": [
            PermissionEntity.ARO_GROUP,
            PermissionEntity.ARO_USER
          ]
        },
        "aro_foreign_key": {
          "type": "string",
          "format": "uuid"
        },
        "type": {
          "type": "integer",
          "enum": [
            PermissionEntity.PERMISSION_READ,
            PermissionEntity.PERMISSION_ADMIN,
            PermissionEntity.PERMISSION_UPDATE
          ]
        },
        "created": {
          "type": "string",
          "format": "date-time"
        },
        "modified": {
          "type": "string",
          "format": "date-time"
        },
        // Associated models
        "user": UserEntity.getSchema(),
        "group": GroupEntity.getSchema()
      }
    }
  }

  // ==================================================
  // Dynamic properties getters
  // ==================================================
  /**
   * Get permission id
   *
   * @returns {string|null} uuid if set
   */
  get id() {
    return this._props.id || null;
  }

  /**
   * Get ACO - Access Control Object
   *
   * @returns {string} Group or User
   */
  get aco() {
    return this._props.aco;
  }

  /**
   * Get ARO - Access Request Object
   *
   * @returns {string} Resource or Folder
   */
  get aro() {
    return this._props.aro;
  }

  /**
   * Get ARO id
   * @returns {string} uuid
   */
  get aroForeignKey() {
    return this._props.aro_foreign_key;
  }

  /**
   * Get ACO id
   * @returns {string} uuid
   */
  get acoForeignKey() {
    return this._props.aco_foreign_key;
  }

  /**
   * Get permission type
   * @returns {int} 1: read, 5: update, 15: admin
   */
  get type() {
    return this._props.type;
  }

  // ==================================================
  // Static properties getters
  // ==================================================
  /**
   * PermissionEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * PermissionEntity.PERMISSION_ADMIN
   * @returns {number}
   */
  static get PERMISSION_ADMIN() {
    return PERMISSION_ADMIN;
  }

  /**
   * PermissionEntity.PERMISSION_UPDATE
   * @returns {number}
   */
  static get PERMISSION_UPDATE() {
    return PERMISSION_UPDATE;
  }

  /**
   * PermissionEntity.PERMISSION_READ
   * @returns {number}
   */
  static get PERMISSION_READ() {
    return PERMISSION_READ;
  }

  /**
   * PermissionEntity.ARO_GROUP
   * @returns {string}
   */
  static get ARO_GROUP() {
    return ARO_GROUP;
  }

  /**
   * PermissionEntity.ARO_USER
   * @returns {string}
   */
  static get ARO_USER() {
    return ARO_USER;
  }

  /**
   * PermissionEntity.ACO_RESOURCE
   * @returns {string}
   */
  static get ACO_RESOURCE() {
    return ACO_RESOURCE;
  }

  /**
   * PermissionEntity.ACO_FOLDER
   * @returns {string}
   */
  static get ACO_FOLDER() {
    return ACO_FOLDER;
  }

  // ==================================================
  // Associated properties getters
  // ==================================================
  /**
   * Get associated user data
   * @returns {UserEntity} user
   */
  get user() {
    return this._user || null;
  }

  /**
   * Get associated group data
   * @returns {GroupEntity} group
   */
  get group() {
    return this._group || null;
  }
}

exports.PermissionEntity = PermissionEntity;
