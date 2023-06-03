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
import PermissionEntity from "../permission/permissionEntity";
import PermissionsCollection from "../permission/permissionsCollection";
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import FavoriteEntity from "../favorite/favoriteEntity";
import ResourceTypeEntity from "../resourceType/resourceTypeEntity";
import TagsCollection from "../tag/tagsCollection";
import ResourceSecretsCollection from "../secret/resource/resourceSecretsCollection";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";


const ENTITY_NAME = 'Resource';
const RESOURCE_NAME_MAX_LENGTH = 255;
const RESOURCE_USERNAME_MAX_LENGTH = 255;
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
    if (this._props.secrets) {
      this._secrets = new ResourceSecretsCollection(this._props.secrets);
      ResourceEntity.assertValidSecrets(this._secrets, this.id);
      delete this._props.secrets;
    }
    if (this._props.favorite) {
      this._favorite = new FavoriteEntity(this._props.favorite);
      ResourceEntity.assertValidFavorite(this._favorite, this.id);
      delete this._props.favorite;
    }
    if (this._props.tags) {
      this._tags = new TagsCollection(this._props.tags);
      delete this._props.tags;
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
        "name"
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
          "anyOf": [{
            "type": "string",
            "maxLength": RESOURCE_USERNAME_MAX_LENGTH
          }, {
            "type": "null"
          }]
        },
        "uri": {
          "anyOf": [{
            "type": "string",
            "maxLength": RESOURCE_URI_MAX_LENGTH
          }, {
            "type": "null"
          }]
        },
        "description": {
          "anyOf": [{
            "type": "string",
            "maxLength": RESOURCE_DESCRIPTION_MAX_LENGTH
          }, {
            "type": "null"
          }]
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
        "folder_parent_id": {
          "anyOf": [{
            "type": "string",
            "format": "uuid"
          }, {
            "type": "null"
          }]
        },
        // Permissions
        "permission": PermissionEntity.getSchema(), // current user permission
        "permissions": PermissionsCollection.getSchema(), // all users permissions
        "personal": {
          "type": "boolean"
        },
        // Resource types
        "resource_type_id": {
          "type": "string",
          "format": "uuid"
        },
        "resource_type": ResourceTypeEntity.getSchema(),
        // other Associations
        "favorite": {
          "anyOf": [
            FavoriteEntity.getSchema(),
            {"type": "null"}
          ]
        },
        "secrets": ResourceSecretsCollection.getSchema(),
        "tags": TagsCollection.getSchema()
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
      result.permission = this._permission.toDto();
    }
    if (this._permissions && contain.permissions) {
      result.permissions = this._permissions.toDto();
    }
    if (this._tags && contain.tag) {
      result.tags = this._tags.toDto();
    }
    if (this._secrets && contain.secrets) {
      result.secrets = this._secrets.toDto();
    }

    // preserve null state
    if (typeof this._favorite !== 'undefined' && contain.favorite) {
      result.favorite = this._favorite === null ? null : this._favorite.toDto();
    }
    return result;
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto(ResourceEntity.ALL_CONTAIN_OPTIONS);
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */
  /**
   * Get resource id
   * @returns {(string|null)} uuid
   */
  get id() {
    return this._props.id || null;
  }

  /**
   * Get resource name
   * @returns {string} admin or user
   */
  get name() {
    return this._props.name;
  }

  /**
   * Get resource username
   * @returns {string} username
   */
  get username() {
    return this._props.username;
  }

  /**
   * Get resource description
   * @returns {(string|null)} description
   */
  get description() {
    return this._props.description || null;
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
   * Get the folder parent id if any
   * @returns {(string|null)} uuid
   */
  get folderParentId() {
    return this._props.folder_parent_id || null;
  }

  /**
   * Get the resource type if any
   * @returns {(string|null)} uuid
   */
  get resourceTypeId() {
    return this._props.resource_type_id || null;
  }

  /**
   * Returns the resource uri
   */
  get uri() {
    return this._props.uri || null;
  }

  /*
   * ==================================================
   * Permissions methods
   * ==================================================
   */
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
    if (this.isPersonal() === null)  {
      return null;
    }
    return !this.isPersonal();
  }

  /**
   * Get resource permission for the current user
   * @returns {(PermissionEntity|null)}
   */
  get permission() {
    return this._permission || null;
  }

  /**
   * Get all resource permissions
   * @returns {(PermissionsCollection|null)}
   */
  get permissions() {
    return this._permissions || null;
  }

  /**
   * Return true if permission is set to owner
   * @returns {(boolean|null)}
   */
  isOwner() {
    if (this.permission === null) {
      return null;
    }
    return this.permission.type === PermissionEntity.PERMISSION_OWNER;
  }

  /**
   * Return true if user can update
   * @returns {boolean}
   */
  canUpdate() {
    return this.permission.type >= PermissionEntity.PERMISSION_UPDATE;
  }

  /**
   * Return true if permission is set to read
   * @returns {(boolean|null)}
   */
  isReadOnly() {
    if (this.permission === null) {
      return null;
    }
    return this.permission.type === PermissionEntity.PERMISSION_READ;
  }

  /**
   * Assert a given folder can be moved
   * @param {ResourceEntity} resourceToMove
   * @param {FolderEntity} parentFolder
   * @param {(FolderEntity|null)} destinationFolder
   * @returns {boolean}
   */
  static canResourceMove(resourceToMove, parentFolder, destinationFolder) {
    if (resourceToMove.isReadOnly()) {
      return ((parentFolder === null || parentFolder.isPersonal()) &&
        (destinationFolder === null || destinationFolder.isPersonal()));
    }
    return (destinationFolder === null || !destinationFolder.isReadOnly());
  }

  /*
   * ==================================================
   * Other associated properties methods
   * ==================================================
   */
  /**
   * Get all resource tags for the current user
   * @returns {(TagsCollection|null)}
   */
  get tags() {
    return this._tags || null;
  }

  /**
   * Get resource favorite object for the current user
   * @returns {(FavoriteEntity|null)}
   */
  get favorite() {
    return this._favorite || null;
  }

  /**
   * Get resource favorite status for the current user
   * @returns {boolean}
   */
  isFavorited() {
    return (this.favorite === true);
  }

  /**
   * Get resource secrets
   * @returns {(ResourceSecretsCollection|null)}
   */
  get secrets() {
    return this._secrets || null;
  }

  /**
   * Get resource secret for the current user
   * @returns {(SecretEntity|null)}
   */
  get secret() {
    for (const secret of this._secrets) {
      return secret;
    }
    return null;
  }

  /*
   * ==================================================
   * Setters
   * ==================================================
   */
  /**
   * Set the secret
   * @param {ResourceSecretsCollection} secretsCollection
   * @throws {EntityValidationError} if secretsCollection is not valid
   */
  set secrets(secretsCollection) {
    ResourceEntity.assertValidSecrets(secretsCollection);
    this._secrets = new ResourceSecretsCollection(secretsCollection.toDto());
  }

  /**
   * Set folder parent id
   * @param {string|null} folderParentId
   * @throws {EntityValidationError} if parent id is not a valid uuid
   */
  set folderParentId(folderParentId) {
    const propName = 'folder_parent_id';
    if (folderParentId === null) {
      this._props[propName] = null;
      return;
    }
    const propSchema = ResourceEntity.getSchema().properties[propName];
    this._props[propName] = EntitySchema.validateProp(propName, folderParentId, propSchema);
  }

  /**
   * Set resource permissions
   * @param {PermissionsCollection} permissions
   */
  set permissions(permissions) {
    this._permissions = permissions;
  }

  /**
   * Set resource tags
   * @param {TagsCollection} tags
   */
  set tags(tags) {
    this._tags = tags;
  }

  /**
   * Set resource favorite
   * @param {FavoriteEntity} favorite
   */
  set favorite(favorite) {
    this._favorite = favorite;
  }

  /*
   * ==================================================
   * Build rules
   * ==================================================
   */
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
    if (permission.aco !== PermissionEntity.ACO_RESOURCE) {
      throw new EntityValidationError('ResourceEntity assertValidPermission not a valid resource permission.');
    }
    if (resourceId && (permission.acoForeignKey !== resourceId)) {
      throw new EntityValidationError('ResourceEntity assertValidPermission resource id doesnt not match foreign key permission.');
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
    for (const permission of permissions) {
      ResourceEntity.assertValidPermission(permission, resourceId);
    }
  }

  /**
   * Additional secret validation rule
   *
   * @param {ResourceSecretsCollection} secrets
   * @param {string} [resourceId] optional
   * @throws {EntityValidationError} if not valid
   */
  static assertValidSecrets(secrets, resourceId) {
    if (!secrets || !secrets.length) {
      throw new EntityValidationError('ResourceEntity assertValidSecrets cannot be empty.');
    }
    if (!(secrets instanceof ResourceSecretsCollection)) {
      throw new EntityValidationError('ResourceEntity assertValidSecrets expect a ResourceSecretsCollection.');
    }
    for (const secret of secrets) {
      if (secret.resourceId && (secret.resourceId !== resourceId)) {
        throw new EntityValidationError('ResourceEntity assertValidSecrets secret resourceId should match the resource id.');
      }
    }
  }

  /**
   * Additional secret validation rule
   *
   * @param {FavoriteEntity} favorite
   * @param {string} [resourceId] optional
   * @throws {EntityValidationError} if not valid
   */
  static assertValidFavorite(favorite, resourceId) {
    if (favorite.foreignKey !== resourceId) {
      throw new EntityValidationError('ResourceEntity assertValidFavorite favorite foreign key should match the resource id.');
    }
    /*
     * if (favorite.foreignModel !== FavoriteEntity.FAVORITE_RESOURCE) {
     *   throw new EntityValidationError('ResourceEntity assertValidFavorite favorite foreign model should be a resource.');
     * }
     */
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * ResourceEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * ResourceEntity.ALL_CONTAIN_OPTIONS
   * @returns {object} all contain options that can be used in toDto()
   */
  static get ALL_CONTAIN_OPTIONS() {
    return {permission: true, permissions: true, secrets: true, favorite: true, tag: true};
  }

  static get URI_MAX_LENGTH() {
    return RESOURCE_URI_MAX_LENGTH;
  }
}

export default ResourceEntity;
