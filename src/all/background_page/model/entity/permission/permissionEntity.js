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
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import GroupEntity from "../group/groupEntity";
import UserEntity from "../user/userEntity";
import Validator from "validator";

const ENTITY_NAME = 'Permission';
const PERMISSION_OWNER = 15;
const PERMISSION_UPDATE = 7;
const PERMISSION_READ = 1;
const ARO_GROUP = 'Group';
const ARO_USER = 'User';
const ACO_RESOURCE = 'Resource';
const ACO_FOLDER = 'Folder';

class PermissionEntity extends Entity {
  /**
   * Permission Entity constructor
   *
   * @param {Object} permissionDto permission
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
          "enum": PermissionEntity.PERMISSION_TYPES
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
    };
  }

  /*
   * ==================================================
   * Serialization
   * ==================================================
   */
  /**
   * Return a DTO ready to be sent to API
   *
   * @param {object} [contain] optional
   * @returns {object}
   */
  toDto(contain) {
    const result = Object.assign({}, this._props);
    if (!contain) {
      return result;
    }
    if (this._user && contain.user) {
      if (contain.user === true) {
        result.user = this._user.toDto();
      } else {
        result.user = this._user.toDto(contain.user);
      }
    }
    if (this._group && contain.group) {
      result.group = this._group.toDto();
    }
    return result;
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto(PermissionEntity.ALL_CONTAIN_OPTIONS);
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */
  /**
   * Get permission id
   * @returns {(string|null)} uuid if set
   */
  get id() {
    return this._props.id || null;
  }

  /**
   * Get ACO - Access Control Object
   * @returns {string} Folder or Resource
   */
  get aco() {
    return this._props.aco;
  }

  /**
   * Get ARO - Access Request Object
   * @returns {string} Groups or User
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

  /**
   * Return true if owner permission
   * @returns {boolean}
   */
  isOwner() {
    return (this.type === PermissionEntity.PERMISSION_OWNER);
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * PermissionEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * PermissionEntity.PERMISSION_OWNER
   * @returns {number}
   */
  static get PERMISSION_OWNER() {
    return PERMISSION_OWNER;
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

  /**
   * PermissionEntity.ALL_CONTAIN_OPTIONS
   * @returns {object} all contain options that can be used in toDto()
   */
  static get ALL_CONTAIN_OPTIONS() {
    return {user: {profile: {avatar: true}}, group: true};
  }

  /**
   * PermissionEntity.PERMISSION_TYPES
   * @returns {number[]}
   */
  static get PERMISSION_TYPES() {
    return [
      PermissionEntity.PERMISSION_READ,
      PermissionEntity.PERMISSION_UPDATE,
      PermissionEntity.PERMISSION_OWNER
    ];
  }

  /*
   * ==================================================
   * Associated properties getters
   * ==================================================
   */
  /**
   * Get associated user data
   * @returns {(UserEntity|null)} user
   */
  get user() {
    return this._user || null;
  }

  /**
   * Get associated group data
   * @returns {(GroupEntity|null)} group
   */
  get group() {
    return this._group || null;
  }

  /*
   * ==================================================
   * Dynamic properties setters
   * ==================================================
   */
  /**
   * Set the permission id
   *
   * @param {string} id
   * @throws {TypeError} if permissions id is not UUID
   */
  set id(id) {
    if (!Validator.isUUID(id)) {
      throw new TypeError('The permission id should be a valid UUID.');
    }
    this._props.id = id;
  }

  /**
   * Set the permission type
   *
   * @param {int} type
   * @param type
   */
  set type(type) {
    if (!type || !PermissionEntity.PERMISSION_TYPES.includes(type)) {
      throw new TypeError('The type should be a valid integer.');
    }
    this._props.type = type;
  }

  /*
   * ==================================================
   * Assertions
   * ==================================================
   */
  /**
   * Basic type assertion helper
   *
   * @param {PermissionEntity} permission
   */
  static assertIsPermission(permission) {
    if (!permission || !(permission instanceof PermissionEntity)) {
      throw new TypeError('Failed to assert the parameter is a valid permission');
    }
  }

  /**
   * Basic type assertion helper
   *
   * @param {PermissionEntity} p1
   * @param {PermissionEntity} p2
   */
  static assertArePermissions(p1, p2) {
    PermissionEntity.assertIsPermission(p1);
    PermissionEntity.assertIsPermission(p2);
  }

  /*
   * ==================================================
   * Permission comparison operators
   * ==================================================
   */
  /**
   * Return true if two given permission have the same id
   *
   * @param {PermissionEntity} p1
   * @param {PermissionEntity} p2
   * @returns {boolean} true if permission ids match
   */
  static isIdMatching(p1, p2) {
    PermissionEntity.assertArePermissions(p1, p2);
    return (p1.id === p2.id);
  }

  /**
   * Return true if two given permission are about the same user or group
   *
   * @param {PermissionEntity} p1
   * @param {PermissionEntity} p2
   * @returns {boolean} true if permissions match
   */
  static isAroMatching(p1, p2) {
    PermissionEntity.assertArePermissions(p1, p2);
    return (p1.aro === p2.aro && p1.aroForeignKey === p2.aroForeignKey);
  }

  /**
   * Return true if two given permission are about the same folder or resource
   *
   * @param {PermissionEntity} p1
   * @param {PermissionEntity} p2
   * @returns {boolean} true if permissions match
   */
  static isAcoMatching(p1, p2) {
    PermissionEntity.assertArePermissions(p1, p2);
    return (p1.aco === p2.aco && p1.acoForeignKey === p2.acoForeignKey);
  }

  /**
   * Return true if two given permission are about the same folder/resource and group/user
   *
   * @param {PermissionEntity} p1
   * @param {PermissionEntity} p2
   * @returns {boolean} true if permissions match
   */
  static isAcoAndAroMatching(p1, p2) {
    PermissionEntity.assertArePermissions(p1, p2);
    return (PermissionEntity.isAcoMatching(p1, p2) && PermissionEntity.isAroMatching(p1, p2));
  }

  /**
   * Return true if two given permission are the same type
   * Example both permission are about an update right
   *
   * @param {PermissionEntity} p1
   * @param {PermissionEntity} p2
   * @returns {boolean} true if permissions match
   */
  static isTypeMatching(p1, p2) {
    PermissionEntity.assertArePermissions(p1, p2);
    return (p1.type === p2.type);
  }

  /**
   * Return true if two given permission aco, aro and type matches
   *
   * @param {PermissionEntity} p1
   * @param {PermissionEntity} p2
   * @returns {boolean} true if permissions match
   */
  static isMatchingAroAcoType(p1, p2) {
    PermissionEntity.assertArePermissions(p1, p2);
    return PermissionEntity.isAcoAndAroMatching(p1, p2) && PermissionEntity.isTypeMatching(p1, p2);
  }

  /**
   * Return the highest permission type
   *
   * @param {PermissionEntity} p1
   * @param {PermissionEntity} p2
   * @returns {int} highest permission type
   */
  static getHighestPermissionType(p1, p2) {
    PermissionEntity.assertArePermissions(p1, p2);
    return (p1.type > p2.type) ? p1.type : p2.type;
  }

  /**
   * Return true if two given permission are the same type
   * Example both permission are about an update right
   *
   * @param {PermissionEntity} p1
   * @param {PermissionEntity} p2
   * @returns {PermissionEntity} the permission with highest type
   */
  static getHighestPermission(p1, p2) {
    PermissionEntity.assertArePermissions(p1, p2);
    return (p1.type > p2.type) ? p1 : p2;
  }

  /*
   * ==================================================
   * Permission factories
   * ==================================================
   */
  /**
   * Create a permission copy to be used by another aco
   * Useful for example when you want to reuse a permission from a folder
   * and apply it to a resource. For example on a move or a share operation.
   *
   * @param aco
   * @param acoForeignKey
   * @returns {PermissionEntity}
   */
  copyForAnotherAco(aco, acoForeignKey) {
    return new PermissionEntity({
      aro: this.aro,
      aro_foreign_key: this.aroForeignKey,
      aco: aco,
      aco_foreign_key: acoForeignKey,
      type: this.type
    });
  }
}

export default PermissionEntity;
