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
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import PermissionEntity from "../permission/permissionEntity";
import PermissionsCollection from "../permission/permissionsCollection";

const ENTITY_NAME = 'Folder';
const FOLDER_NAME_MIN_LENGTH = 1;
const FOLDER_NAME_MAX_LENGTH = 256;

class FolderEntity extends Entity {
  /**
   * Folder entity constructor
   *
   * @param {Object} folderDto folder
   * @throws {EntityValidationError} if the dto cannot be converted into an entity
   * @throws {EntityValidationError} if permissions are not for folder or not matching foreign key
   */
  constructor(folderDto) {
    super(EntitySchema.validate(
      FolderEntity.ENTITY_NAME,
      folderDto,
      FolderEntity.getSchema()
    ));

    // if no parent id specified set it to null
    if (!Object.prototype.hasOwnProperty.call(this._props, 'folder_parent_id')) {
      this._props.folder_parent_id = null;
    }

    // Associations
    if (this._props.permission) {
      this._permission = new PermissionEntity(this._props.permission);
      FolderEntity.assertValidPermission(this._permission, this.id);
      delete this._props.permission;
    }
    if (this._props.permissions) {
      this._permissions = new PermissionsCollection(this._props.permissions);
      FolderEntity.assertValidPermissions(this._permissions, this.id);
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
          }]
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
        "personal": {
          "type": "boolean",
        },
        "permission": PermissionEntity.getSchema(), // current user permission
        "permissions": PermissionsCollection.getSchema() // all users permissions
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
    if (this._permission && contain.permission) {
      // TODO More granular permission.group permission.user.avatar
      result.permission = this._permission.toDto(PermissionEntity.ALL_CONTAIN_OPTIONS);
    }
    if (this._permissions && contain.permissions) {
      // TODO More granular permissions.group permissions.user
      result.permissions = this._permissions.toDto(PermissionEntity.ALL_CONTAIN_OPTIONS);
    }
    return result;
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto(FolderEntity.ALL_CONTAIN_OPTIONS);
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */
  /**
   * Get folder id
   * @returns {(string|null)} uuid
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
   * @returns {(string|null)} uuid parent folder
   */
  get folderParentId() {
    return this._props.folder_parent_id || null;
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
   * Associated properties methods
   * ==================================================
   */
  /**
   * Get all the current user permissions
   * @returns {{PermissionEntity|null}} permission
   */
  get permission() {
    return this._permission || null;
  }

  /**
   * Get all users permissions for the given folder
   * @returns {{PermissionsCollection|null}} permissions
   */
  get permissions() {
    return this._permissions || null;
  }

  /**
   * Return true if permission is set to owner
   * @returns {boolean}
   */
  isOwner() {
    if (this.permission === null) {
      return false;
    }
    return this.permission.type === PermissionEntity.PERMISSION_OWNER;
  }

  /**
   * Return true if user can update
   * @returns {boolean}
   */
  canUpdate() {
    if (!this.permission || !this.permission.type) {
      return false;
    }
    return this.permission.type >= PermissionEntity.PERMISSION_UPDATE;
  }

  /**
   * Return true if permission is set to read
   * @returns {boolean}
   */
  isReadOnly() {
    if (this.permission === null) {
      return false;
    }
    return this.permission.type === PermissionEntity.PERMISSION_READ;
  }

  /**
   * Get is personal flag
   * @returns {(boolean|null)}
   */
  isPersonal() {
    if (Object.prototype.hasOwnProperty.call(this._props, 'personal')) {
      return this._props.personal;
    }
    if (this.permissions) {
      return this.permissions.length === 1;
    }
    return null;
  }

  /**
   * Get is shared flag
   * @returns {(boolean|null)}
   */
  isShared() {
    if (this.isPersonal() === null) {
      return null;
    }
    return !this.isPersonal();
  }

  /**
   * Additional permission validation rule
   * Check that the permission is for a folder
   * Check that id match foreignKey if any
   *
   * @param {PermissionEntity} permission
   * @param {string} [folderId] optional
   * @throws {EntityValidationError} if not valid
   */
  static assertValidPermission(permission, folderId) {
    if (!permission) {
      throw new EntityValidationError('FolderEntity assertValidPermission expect a permission.');
    }
    if (permission.aco !== PermissionEntity.ACO_FOLDER) {
      throw new EntityValidationError('FolderEntity assertValidPermission not a valid folder permission.');
    }
    if (folderId && permission.acoForeignKey !== folderId) {
      throw new EntityValidationError('FolderEntity assertValidPermission folder id doesnt not match foreign key permission.');
    }
  }

  /**
   * Additional permissions validation rule
   *
   * @param {PermissionsCollection} permissions
   * @param {string} [folderId] optional
   * @throws {EntityValidationError} if not valid
   */
  static assertValidPermissions(permissions, folderId) {
    if (!permissions || !permissions.length) {
      throw new EntityValidationError('FolderEntity assertValidPermissions expect an array of permissions.');
    }
    for (const permission of permissions) {
      FolderEntity.assertValidPermission(permission, folderId);
    }
  }

  /**
   * Assert a given folder can be moved
   * @param {FolderEntity} folderToMove
   * @param {FolderEntity} parentFolder
   * @param {(FolderEntity|null)} destinationFolder
   * @returns {boolean}
   */
  static canFolderMove(folderToMove, parentFolder, destinationFolder) {
    if (folderToMove.isReadOnly()) {
      return ((parentFolder === null || parentFolder.isPersonal()) &&
         (destinationFolder === null || destinationFolder.isPersonal()));
    }
    return (destinationFolder === null || !destinationFolder.isReadOnly());
  }

  /*
   * ==================================================
   * Default properties setters
   * ==================================================
   */
  /**
   * Folder Parent Id
   * @param {string|null} folderParentId optional
   * @throws {EntityValidationError} if parent id is not a valid uuid
   */
  set folderParentId(folderParentId) {
    const propName = 'folder_parent_id';
    if (!folderParentId) {
      this._props[propName] = null;
      return;
    }
    const propSchema = FolderEntity.getSchema().properties[propName];
    this._props[propName] = EntitySchema.validateProp(propName, folderParentId, propSchema);
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * FolderEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * FolderEntity.ALL_CONTAIN_OPTIONS
   * @returns {object} all contain options that can be used in toDto()
   */
  static get ALL_CONTAIN_OPTIONS() {
    return {permission: true, permissions: true};
  }
}

export default FolderEntity;
