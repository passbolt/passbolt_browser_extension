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
const {EntityValidationError} = require('../abstract/entityValidationError');
const {PermissionEntity} = require('../permission/permissionEntity');
const {PermissionsCollection} = require('../permission/permissionsCollection');

const ENTITY_NAME = 'Resource';
const RESOURCE_NAME_MAX_LENGTH = 255;
const RESOURCE_USERNAME_MAX_LENGTH = 64;
const RESOURCE_URI_MAX_LENGTH = 1024;
const RESOURCE_DESCRIPTION_MAX_LENGTH = 10000;

class ResourceEntity extends Entity {
  /**
   * Resource entity constructor
   *
   * @param {Object} resourceDto resource DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(resourceDto) {
    super(EntitySchema.validate(
      ResourceEntity.ENTITY_NAME,
      resourceDto,
      ResourceEntity.getSchema()
    ));

    // Associations
    if (this._props.permission) {
      this._permission = new PermissionEntity(this._props.permission);
      ResourceEntity.assertValidPermission(this._permission, this.id);
      delete this._props.permission;
    }
    if (this._props.permissions) {
      this._permissions = new PermissionsCollection(this._props.permissions);
      ResourceEntity.assertValidPermissions(this._permissions, this.id);
      delete this._props.permissions;
    }
  }

  /**
   * Get resource entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "name",
        "username",
        "uri",
        "description"
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "name": {
          "type": "string",
          "maxLength": RESOURCE_NAME_MAX_LENGTH
        },
        "username": {
          "type": "string",
          "maxLength": RESOURCE_USERNAME_MAX_LENGTH
        },
        "uri": {
          "type": "string",
          "maxLength": RESOURCE_URI_MAX_LENGTH
        },
        "description": {
          "type": "string",
          "maxLength": RESOURCE_DESCRIPTION_MAX_LENGTH
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
        "permission": PermissionEntity.getSchema(), // current user permission
        "permissions": PermissionsCollection.getSchema() // all users permissions
        // secret
        // TODO
      }
    }
  }

  // ==================================================
  // Dynamic properties getters
  // ==================================================
  /**
   * Get resource id
   * @returns {string} uuid
   */
  get id() {
    return this._props.id;
  }

  /**
   * Get resource name
   * @returns {string} admin or user
   */
  get name() {
    return this._props.name;
  }

  /**
   * Get resource description
   * @returns {string} description
   */
  get description() {
    return this._props.description || null;
  }

  /**
   * Get deleted flag info
   * @returns {boolean} true if deleted
   */
  get isDeleted() {
    return this._props.deleted || null;
  }

  /**
   * Get created date
   * @returns {string} date
   */
  get created() {
    return this._props.created || null;
  }

  /**
   * Get modified date
   * @returns {string} date
   */
  get modified() {
    return this._props.modified || null;
  }

  /**
   * Get created by user id
   * @returns {string} uuid
   */
  get createdBy() {
    return this._props.created_by || null;
  }

  /**
   * Get modified by user id
   * @returns {string} date
   */
  get modifiedBy() {
    return this._props.modified_by || null;
  }

  // ==================================================
  // Associated properties methods
  // ==================================================
  /**
   * Get all the current user permissions
   * @returns {PermissionEntity} permission
   */
  get permission() {
    return this._permission || null;
  }

  /**
   * Get all users permissions for the given folder
   * @returns {PermissionsCollection} permissions
   */
  get permissions() {
    return this._permissions || null;
  }

  /**
   * Additional permission validation rule
   * Check that the permission is for a resource
   * Check that id match foreignKey if any
   *
   * @param {PermissionEntity} permission
   * @param {string} [resourceId] optional
   * @throws {EntityValidationError} if not valid
   */
  static assertValidPermission(permission, resourceId) {
    if (!permission) {
      throw new EntityValidationError('ResourceEntity assertValidPermission expect a permission.');
    }
    if (permission.aro !== PermissionEntity.ACO_RESOURCE) {
      throw new EntityValidationError('ResourceEntity assertValidPermission not a valid folder permission.');
    }
    if (resourceId && permission.acoForeignKey !== resourceId) {
      throw new EntityValidationError('ResourceEntity assertValidPermission folder id doesnt not match foreign key permission.');
    }
  }

  /**
   * Additional permissions validation rule
   *
   * @param {PermissionsCollection} permissions
   * @param {string} [resourceId] optional
   * @throws {EntityValidationError} if not valid
   */
  static assertValidPermissions(permissions, resourceId) {
    if (!permissions || !permissions.length) {
      throw new EntityValidationError('ResourceEntity assertValidPermissions expect an array of permissions.');
    }
    for (let permission of permissions) {
      ResourceEntity.assertValidPermission(permission, resourceId);
    }
  }

  // ==================================================
  // Static properties getters
  // ==================================================
  /**
   * ResourceEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

exports.ResourceEntity = ResourceEntity;
