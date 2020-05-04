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
const {PermissionEntity} = require('../permission/permissionEntity');
const {PermissionsCollection} = require('../permission/permissionsCollection');

const ENTITY_NAME = 'Folder';
const FOLDER_NAME_MIN_LENGTH = 1;
const FOLDER_NAME_MAX_LENGTH = 64;

class FolderEntity extends Entity {
  /**
   * Folder entity constructor
   *
   * @param {Object} folderDto folder DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(folderDto) {
    super(EntitySchema.validate(
      FolderEntity.ENTITY_NAME,
      folderDto,
      FolderEntity.getSchema()
    ));

    // Associations
    if (this._props.permission) {
      this._permission = new PermissionEntity(this._props.permission);
      delete this._props.permission;
    }
    if (this._props.permissions) {
      this._permissions = new PermissionsCollection(this._props.permissions);
      delete this._props.permissions;
    }
  }

  /**
   * Get folder entity schema
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
        "folder_parent_id": {
          "anyOf": [{
              "type": "string",
              "format": "uuid"
            }, {
              "type": "null"
            }
          ]
        },
        "name": {
          "type": "string",
          "minLength": FOLDER_NAME_MIN_LENGTH,
          "maxLength": FOLDER_NAME_MAX_LENGTH
        },
        "created_by": {
          "type": "string",
          "format": "uuid"
        },
        "modified_by": {
          "type": "string",
          "format": "uuid"
        },
        "created": {
          "type": "string",
          "format": "date-time"
        },
        "modified": {
          "type": "string",
          "format": "date-time"
        },
        "permission": PermissionEntity.getSchema(), // current user permission
        "permissions": PermissionsCollection.getSchema() // all users permissions
      }
    }
  }

  /**
   * Return a DTO ready to be sent to API
   *
   * @param {object} [contain] optional
   * @returns {object}
   */
  toDto(contain) {
    let result = Object.assign({}, this._props);

    if (contain && contain.permission) {
      if (this._permission) {
        result.permission = this._permission ? this._permission.toDto() : null;
      }
    }
    if (contain && contain.permissions) {
      if (this._permissions) {
        result.permissions = this._permissions ? this._permissions.toDto() : null;
      }
    }
    return result;
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto({permission: true, permissions: true});
  }

  // ==================================================
  // Dynamic properties getters
  // ==================================================
  /**
   * Get folder id
   * @returns {string} uuid
   */
  get id() {
    return this._props.id || null;
  }

  /**
   * Get folder name
   * @returns {string} admin or user
   */
  get name() {
    return this._props.name;
  }

  /**
   * Get folder parent id
   * @returns {string} uuid parent folder
   */
  get folderParentId() {
    return this._props.folder_parent_id || null;
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

  // ==================================================
  // Static properties getters
  // ==================================================
  /**
   * FolderEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  // ==================================================
  // Associated properties getters
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

  // ==================================================
  // Default properties setters
  // ==================================================
  /**
   * Folder Parent Id
   * @param {string|null} folderParentId optional
   * @throws {EntityValidationError} if parent id is not a valid uuid
   * @returns void
   * @public
   */
  set folderParentId(folderParentId) {
    const propName = 'folder_parent_id';
    if (!folderParentId ) {
      this._props[propName] = null;
      return;
    }
    const propSchema = FolderEntity.getSchema().properties[propName];
    this._props[propName] = EntitySchema.validateProp(propName, folderParentId, propSchema)
  }
}

exports.FolderEntity = FolderEntity;
