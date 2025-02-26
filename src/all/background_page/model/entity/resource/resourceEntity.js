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
import FavoriteEntity from "../favorite/favoriteEntity";
import ResourceTypeEntity from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeEntity";
import TagsCollection from "../tag/tagsCollection";
import ResourceSecretsCollection from "../secret/resource/resourceSecretsCollection";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import canSuggestUrl from "../../../utils/url/canSuggestUrl";
import EntityV2 from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2";
import UserEntity from "../user/userEntity";
import ResourceMetadataEntity from "passbolt-styleguide/src/shared/models/entity/resource/metadata/resourceMetadataEntity";

const ENTITY_NAME = 'Resource';

export const METADATA_KEY_TYPE_USER_KEY = "user_key";
export const METADATA_KEY_TYPE_METADATA_KEY = "shared_key";

const SUPPORTED_METADATA_KEY_TYPES = [
  METADATA_KEY_TYPE_USER_KEY,
  METADATA_KEY_TYPE_METADATA_KEY,
];

class ResourceEntity extends EntityV2 {
  /**
   * @inheritDoc
   * @throws {EntityValidationError} Build Rule: The collection of secrets, if provided, cannot be empty.
   * @throws {EntityValidationError} Build Rule: Verify that the secrets associated resource ID corresponds with the
   * resource ID.
   * @throws {EntityValidationError} Build Rule: Verify that the permission is designated for a resource, and its
   * associated aco foreign key corresponds with the resource ID.
   * @throws {EntityValidationError} Build Rule: Verify that the permissions are designated for a resource, and their
   * associated aco foreign keys correspond with the resource ID.
   * @throws {EntityValidationError} Build Rule: Verify that the favorite associated foreign key corresponds with
   * the resource ID.
   */
  constructor(dto, options = {}) {
    super(dto, options);

    // Associations
    if (this._props.permission) {
      this._permission = new PermissionEntity(this._props.permission, {...options, clone: false});
      ResourceEntity.assertValidPermission(this._permission, this.id);
      delete this._props.permission;
    }
    if (this._props.permissions) {
      this._permissions = new PermissionsCollection(this._props.permissions, {...options, clone: false});
      ResourceEntity.assertValidPermissions(this._permissions, this.id);
      delete this._props.permissions;
    }
    if (this._props.secrets) {
      this._secrets = new ResourceSecretsCollection(this._props.secrets, {...options, clone: false});
      ResourceEntity.assertValidSecrets(this._secrets, this.id);
      delete this._props.secrets;
    }
    if (this._props.favorite) {
      this._favorite = new FavoriteEntity(this._props.favorite, {...options, clone: false});
      ResourceEntity.assertValidFavorite(this._favorite, this.id);
      delete this._props.favorite;
    }
    if (this._props.tags) {
      this._tags = new TagsCollection(this._props.tags, {...options, clone: false});
      delete this._props.tags;
    }
    if (this._props.creator) {
      this._creator = new UserEntity(this._props.creator, {...options, clone: false});
      delete this._props._creator;
    }
    if (this._props.modifier) {
      this._modifier = new UserEntity(this._props.modifier, {...options, clone: false});
      delete this._props._modifier;
    }
    if (this._props.metadata && typeof this._props.metadata !== 'string') {
      this._metadata = new ResourceMetadataEntity(this._props.metadata, {...options, clone: false});
      delete this._props.metadata;
    }
  }

  /**
   * @inheritDoc
   */
  marshall() {
    ResourceEntity.transformDtoFromV4toV5(this._props);
  }

  /**
   * @inheritDoc
   */
  validateBuildRules() {
    if (Boolean(this._props.metadata) && Boolean(this._metadata)) {
      const error = new EntityValidationError();
      const message = "The property metadata and _metadata cannot be set at the same time";
      error.addError("metadata", "only-one-defined", message);
      throw error;
    }
  }

  /**
   * Get resource entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    const userSchema = UserEntity.getSchema();
    return {
      "type": "object",
      "required": [
        "metadata",
        "resource_type_id"
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "resource_type_id": {
          "type": "string",
          "format": "uuid"
        },
        "metadata_key_id": {
          "type": "string",
          "format": "uuid",
          "nullable": true
        },
        "metadata_key_type": {
          "type": "string",
          "enum": SUPPORTED_METADATA_KEY_TYPES,
          "nullable": true
        },
        "expired": {
          "type": "string",
          "format": "date-time",
          "nullable": true,
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
          "type": "string",
          "format": "uuid",
          "nullable": true,
        },
        "personal": {
          "type": "boolean",
          "nullable": true,
        },
        // Associated models
        "metadata": {"anyOf": [
          {
            "type": "string",
            "pattern": /^-----BEGIN PGP MESSAGE-----([\r\n])([ -9;-~]{1,76}: [ -~]{1,76}([\r\n]))*\n([a-zA-Z0-9\/+=]{1,76}([\r\n]))*=[a-zA-Z0-9\/+=]{4}([\r\n])-----END PGP MESSAGE-----([\r\n]*)$/
          },
          ResourceMetadataEntity.getSchema()
        ]},
        "favorite": {
          ...FavoriteEntity.getSchema(),
          "nullable": true,
        },
        "permission": PermissionEntity.getSchema(), // current user permission
        "permissions": PermissionsCollection.getSchema(), // all users permissions
        "resource_type": ResourceTypeEntity.getSchema(),
        "secrets": ResourceSecretsCollection.getSchema(),
        "tags": TagsCollection.getSchema(),
        "creator": userSchema,
        "modifier": userSchema,
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
    result.metadata = result.metadata || this._metadata.toDto();
    if (!contain) {
      return result;
    }
    // preserve null state
    if (typeof this._favorite !== 'undefined' && contain.favorite) {
      result.favorite = this._favorite === null ? null : this._favorite.toDto();
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
    if (this._creator && contain.creator) {
      result.creator = this._creator.toDto(UserEntity.ALL_CONTAIN_OPTIONS);
    }
    if (this._modifier && contain.modifier) {
      result.modifier = this._modifier.toDto(UserEntity.ALL_CONTAIN_OPTIONS);
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
   * Get the metadata key id if any
   * @returns {string|null} uuid
   */
  get metadataKeyId() {
    return this._props.metadata_key_id || null;
  }

  /**
   * Get the metadata key type
   * @returns {string|null}
   */
  get metadataKeyType() {
    return this._props.metadata_key_type || null;
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
      return this.permissions.length === 1; //@todo dangerous, could be a group permission having mulitple members.
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
   * Get resource metadata
   * @returns {(ResourceMetadataEntity|string)}
   */
  get metadata() {
    return this.isMetadataDecrypted() ? this._metadata : this._props.metadata;
  }

  /**
   * Check if the metadata is decrypted.
   * @returns {boolean}
   */
  isMetadataDecrypted() {
    return Boolean(this._metadata);
  }

  /**
   * Check if the metadata key type is user key.
   * @returns {boolean}
   */
  isMetadataKeyTypeUserKey() {
    return this._props.metadata_key_type === METADATA_KEY_TYPE_USER_KEY;
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
   * Assert the current entity can be moved to the destination folder given a parent folder
   * @param {FolderEntity|null} parentFolder
   * @param {FolderEntity|null} destinationFolder
   * @returns {boolean}
   */
  canMove(parentFolder, destinationFolder) {
    if (this.isReadOnly()) {
      return ((parentFolder === null || parentFolder.isPersonal()) &&
        (destinationFolder === null || destinationFolder.isPersonal()));
    }
    return (destinationFolder === null || !destinationFolder.isReadOnly());
  }

  /*
   * ==================================================
   * Meta data relative
   * ==================================================
   */

  /**
   * Check if the resource could be a suggestion for a given url
   * @param {string} url The url to suggest for.
   * @returns {boolean}
   */
  isSuggestion(url) {
    return canSuggestUrl(url, this.metadata.uris?.[0]);
  }

  /**
   * Transform DTO from V4 to V5
   * @param {Object} resourceDTO dto v4
   * @returns {Object} resourceDTO dto v5
   */
  static transformDtoFromV4toV5(resourceDTO) {
    // Metadata is null or undefined. Prevent metadata having false value to create an empty metadata
    if (resourceDTO.metadata == null) {
      resourceDTO.metadata = {
        object_type: ResourceMetadataEntity.METADATA_OBJECT_TYPE,
        resource_type_id: resourceDTO.resource_type_id,
        name: resourceDTO.name,
        username: resourceDTO.username || null,
        uris: resourceDTO.uri ? [resourceDTO.uri] : [],
        description: resourceDTO.description || null
      };
    }
    // Remove all legacy metadata at the root object
    delete resourceDTO.name;
    delete resourceDTO.username;
    delete resourceDTO.uri;
    delete resourceDTO.description;
    return resourceDTO;
  }

  /**
   * Transform v5 format to v4 format
   * @used for to communicate with API
   * @param {object} [contain] optional
   * @returns {Object} resourceDTO dto v5
   */
  toV4Dto(contain) {
    const resourceDTO = this.toDto(contain);
    resourceDTO.name = resourceDTO.metadata.name;
    resourceDTO.username = resourceDTO.metadata.username;
    resourceDTO.uri = resourceDTO.metadata.uris?.[0] || "";
    resourceDTO.description = resourceDTO.metadata.description;
    delete resourceDTO.metadata;
    return resourceDTO;
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

  /**
   * Set resource metadata
   * @param {ResourceMetadataEntity|object|string} metadata
   */
  set metadata(metadata) {
    if (metadata instanceof ResourceMetadataEntity) {
      this._metadata = new ResourceMetadataEntity(metadata.toDto(), {validate: false});
      delete this._props.metadata;
    } else if (typeof metadata === "object") {
      this._metadata = new ResourceMetadataEntity(metadata);
      delete this._props.metadata;
    } else {
      EntitySchema.validateProp("metadata", metadata, ResourceEntity.getSchema().properties.metadata.anyOf[0]);
      this._props.metadata = metadata;
      delete this._metadata;
    }
  }

  /**
   * Set resource metadata key id
   * @param {string} metadataKeyId
   */
  set metadataKeyId(metadataKeyId) {
    EntitySchema.validateProp("metadata_key_id", metadataKeyId, ResourceEntity.getSchema().properties.metadata_key_id);
    this._props.metadata_key_id = metadataKeyId;
  }

  /**
   * Set resource metadata key type
   * @param {string} metadataKeyType
   */
  set metadataKeyType(metadataKeyType) {
    EntitySchema.validateProp("metadata_key_type", metadataKeyType, ResourceEntity.getSchema().properties.metadata_key_type);
    this._props.metadata_key_type = metadataKeyType;
  }

  /**
   * Set resource personal
   * @param {boolean} personal
   */
  set personal(personal) {
    EntitySchema.validateProp("personal", personal, ResourceEntity.getSchema().properties.personal);
    this._props.personal = personal;
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
   * ResourceEntity.METADATA_USER_KEY
   * @returns {string}
   */
  static get METADATA_KEY_TYPE_USER_KEY() {
    return METADATA_KEY_TYPE_USER_KEY;
  }

  /**
   * ResourceEntity.METADATA_KEY
   * @returns {string}
   */
  static get METADATA_KEY_TYPE_METADATA_KEY() {
    return METADATA_KEY_TYPE_METADATA_KEY;
  }

  /**
   * ResourceEntity.ALL_CONTAIN_OPTIONS
   * @returns {object} all contain options that can be used in toDto()
   */
  static get ALL_CONTAIN_OPTIONS() {
    return {permission: true, permissions: true, secrets: true, favorite: true, tag: true, creator: true, modifier: true};
  }
}

export default ResourceEntity;
