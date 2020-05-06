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
const {PermissionEntity} = require('./permissionEntity');

const ENTITY_NAME = 'PermissionChange';
const PERMISSION_CHANGE_CREATE = 'create';
const PERMISSION_CHANGE_DELETE = 'delete';
const PERMISSION_CHANGE_UPDATE = 'update';

class PermissionChangeEntity extends Entity {
  /**
   * Permission entity constructor
   *
   * @param {Object} permissionChangesDto data transfer object
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(permissionChangesDto) {
    super(EntitySchema.validate(
      PermissionChangeEntity.ENTITY_NAME,
      permissionChangesDto,
      PermissionChangeEntity.getSchema()
    ));
  }

  /**
   * A permission change is basically a Permission entity
   * Without the dates, without the associated data like user, group, etc.
   * With additional deleted fields (boolean flags)
   */
  static getSchema() {
    const schema = PermissionEntity.getSchema();
    const whitelistProps = schema.required;
    const extendedSchema = {
      "type": "object",
      "required": schema.required,
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
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
   * @param {PermissionEntity} permission
   * @param {string} operation create, update, delete
   * @throws {TypeError} if parameters are not valid
   * @return {PermissionChangeEntity}
   */
  static createFromPermission(permission, operation) {
    if (!permission || !(permission instanceof PermissionEntity)) {
      throw new TypeError('PermissionChangeEntity createFromPermission expect a permission entity.');
    }
    let changeDto = {
      aco: permission.aco,
      aro: permission.aro,
      aco_foreign_key: permission.acoForeignKey,
      aro_foreign_key: permission.aroForeignKey,
      type: permission.type,
    };
    switch(operation) {
      case PermissionChangeEntity.PERMISSION_CHANGE_CREATE:
          // nothing to do
        break;
      case PermissionChangeEntity.PERMISSION_CHANGE_UPDATE:
        if (!permission.id) {
          throw new TypeError('PermissionChangeEntity createFromPermission update expect a permission id.');
        }
        changeDto.id = permission.id;
        break;
      case PermissionChangeEntity.PERMISSION_CHANGE_DELETE:
        if (!permission.id) {
          throw new TypeError('PermissionChangeEntity createFromPermission delete expect a permission id.');
        }
        changeDto.id = permission.id;
        changeDto.delete = true;
        break;
      default:
        throw new TypeError('PermissionChangeEntity createFromPermission unsupported operation');
    }
    return new PermissionChangeEntity(changeDto);
  }

  // ==================================================
  // Dynamic properties getters
  // ==================================================
  /**
   * Get permission id
   * @returns {string|null} uuid if set
   */
  get id() {
    return this._props.id || null;
  }

  /**
   * Get ACO - Access Control Object
   * @returns {string} Group or User
   */
  get aco() {
    return this._props.aco;
  }

  /**
   * Get ARO - Access Request Object
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

  /**
   * Get deleted status flag
   * @returns {boolean} true if deleted
   */
  get isDeleted() {
    return this._props.deleted || null;
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
   * PermissionEntity.PERMISSION_CHANGE_CREATE
   * @returns {string}
   */
  static get PERMISSION_CHANGE_CREATE() {
    return PERMISSION_CHANGE_CREATE;
  }

  /**
   * PermissionEntity.PERMISSION_CHANGE_UPDATE
   * @returns {string}
   */
  static get PERMISSION_CHANGE_UPDATE() {
    return PERMISSION_CHANGE_UPDATE;
  }

  /**
   * PermissionEntity.PERMISSION_CHANGE_DELETE
   * @returns {string}
   */
  static get PERMISSION_CHANGE_DELETE() {
    return PERMISSION_CHANGE_DELETE;
  }
}

exports.PermissionChangeEntity = PermissionChangeEntity;
