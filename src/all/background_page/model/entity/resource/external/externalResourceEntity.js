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
import ResourceEntity from "../resourceEntity";
import ExternalFolderEntity from "../../folder/external/externalFolderEntity";
import ResourceSecretsCollection from "../../secret/resource/resourceSecretsCollection";
import ExternalTotpEntity from "../../totp/externalTotpEntity";
import ResourceMetadataEntity from "passbolt-styleguide/src/shared/models/entity/resource/metadata/resourceMetadataEntity";
import EntityV2 from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import {assertType} from "../../../../utils/assertions";
import IconEntity from "passbolt-styleguide/src/shared/models/entity/resource/metadata/IconEntity";

const DEFAULT_RESOURCE_NAME = '(no name)';

class ExternalResourceEntity extends EntityV2 {
  /**
   * @inheritDoc
   * @throws {EntityValidationError} Build Rule: The collection of secrets cannot be empty.
   * @throws {EntityValidationError} Build Rule: Verify that the secrets associated resource ID corresponds with the
   * resource ID.
   */
  constructor(dto, options = {}) {
    super(dto, options);

    // Associations
    if (this._props.secrets) {
      this._secrets = new ResourceSecretsCollection(this._props.secrets, {clone: false});
      ResourceEntity.assertValidSecrets(this._secrets, this.id);
      delete this._props.secrets;
    }

    if (this._props.totp) {
      this._totp = new ExternalTotpEntity(this._props.totp, {clone: false});
      delete this._props.totp;
    }

    if (this._props.icon) {
      try {
        this._icon = new IconEntity(this._props.icon, {clone: false});
      } catch (e) {
        console.warn("The associated icon entity could not be set.", e);
      }
      delete this._props.icon;
    }
  }

  /**
   * @inheritdoc
   * Sanitize:
   * - Override default data using the data provided in the DTO.
   * - Normalize the folder parent path, see ExternalFolderEntity::sanitizePath
   */
  marshall() {
    this._props.name = this._props.name || ExternalResourceEntity.DEFAULT_RESOURCE_NAME;
    this._props.secret_clear = this._props.secret_clear || "";

    if (typeof this._props.folder_parent_path === "string") {
      this._props.folder_parent_path = ExternalFolderEntity.sanitizePath(this._props.folder_parent_path);
    } else if (!this._props.folder_parent_path) {
      this._props.folder_parent_path = "";
    }

    super.marshall();
  }

  /**
   * Get resource entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    const resourceEntitySchema = ResourceEntity.getSchema();
    const metadataEntitySchema = ResourceMetadataEntity.getSchema();

    return {
      "type": "object",
      "required": [
        "name",
        "secret_clear"
      ],
      "properties": {
        "id": resourceEntitySchema.properties.id,
        "name": metadataEntitySchema.properties.name,
        "username": metadataEntitySchema.properties.username,
        "uri": {
          "type": "string",
          "maxLength": ResourceMetadataEntity.URI_MAX_LENGTH,
        },
        "description": metadataEntitySchema.properties.description,
        "secrets": resourceEntitySchema.properties.secrets,
        "folder_parent_id": resourceEntitySchema.properties.folder_parent_id,
        "resource_type_id": resourceEntitySchema.properties.resource_type_id,
        "secret_clear": {
          "type": "string"
        },
        "totp": {
          ...ExternalTotpEntity.getSchema(),
          "nullable": true,
        },
        "folder_parent_path": {
          "type": "string"
        },
        "expired": resourceEntitySchema.properties.expired,
        "icon": IconEntity.getSchema(),
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
   * @returns {object}
   */
  toDto() {
    const result = Object.assign({}, this._props);
    if (this._secrets) {
      result.secrets = this._secrets.toDto();
    }

    if (this._totp) {
      result.totp = this._totp.toDto();
    }

    if (this._icon) {
      result.icon = this._icon.toDto();
    }

    return result;
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {Object}
   */
  toJSON() {
    return this.toDto();
  }

  /**
   * Builds from a resource entity DTO an external resource entity DTO.
   * @param {Object} resourceEntityDto
   * @param {ExternalFolderEntity} [externalFolderParent]
   * @returns {Object}
   */
  static buildDtoFromResourceEntityDto(resourceEntityDto, externalFolderParent) {
    return {
      id: resourceEntityDto.id,
      name: resourceEntityDto.metadata.name,
      username: resourceEntityDto.metadata.username,
      uri: resourceEntityDto.metadata.uris?.[0] || "",
      description: resourceEntityDto.metadata.description || null,
      secrets: resourceEntityDto.secrets || [],
      folder_parent_id: externalFolderParent?.id || null,
      resource_type_id: resourceEntityDto.resource_type_id,
      folder_parent_path: externalFolderParent?.path || "",
      expired: resourceEntityDto.expired || null,
    };
  }

  /**
   * Returns a Resource DTO in v5 format.
   * @returns {Object}
   */
  toResourceEntityImportDto() {
    const data = {
      metadata: {
        object_type: ResourceMetadataEntity.METADATA_OBJECT_TYPE,
        name: this.name,
        username: this.username,
        uris: [this.uri || ""],
        description: this.description,
        resource_type_id: this.resourceTypeId,
      },
      secrets: this._secrets.toDto(),
      folder_parent_id: this.folderParentId,
      resource_type_id: this.resourceTypeId,
      expired: this.expired,
      personal: true, //set to true to enforce usage of user's key to encrypt metadata during import
    };

    if (this._icon) {
      data.metadata.icon = this._icon.toDto();
    }

    return data;
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */

  /**
   * Get resource id
   * @returns {string|null}
   */
  get id() {
    return this._props.id || null;
  }

  /**
   * Get resource name
   * @returns {string}
   */
  get name() {
    return this._props.name;
  }

  /**
   * Get resource username
   * @returns {string|null}
   */
  get username() {
    return this._props.username || null;
  }

  /**
   * Get resource uri
   * @returns {string|null}
   */
  get uri() {
    return this._props.uri || null;
  }

  /**
   * Get resource description
   * @returns {string|null}
   */
  get description() {
    return this._props.description || null;
  }

  /**
   * Get secret in clear
   * @returns {string} secret in clear
   */
  get secretClear() {
    return this._props.secret_clear;
  }
  /**
   * Get folder parent id
   * @returns {string|null}
   */
  get folderParentId() {
    return this._props.folder_parent_id || null;
  }

  /**
   * Get folder parent path
   * @returns {string}
   */
  get folderParentPath() {
    return this._props.folder_parent_path || "";
  }

  /**
   * Get the resource type if any
   * @returns {string|null} uuid
   */
  get resourceTypeId() {
    return this._props.resource_type_id || null;
  }

  /**
   * Get the resource expiry date if any
   * @returns {string|null}
   */
  get expired() {
    return this._props.expired || null;
  }

  /*
   * ==================================================
   * Calculated properties getters
   * ==================================================
   */

  /**
   * Get resource path
   * @returns {string}
   */
  get path() {
    return this.folderParentPath ? `${this.folderParentPath}/${this.name}` : this.name;
  }

  /**
   * Get resource depth
   * @returns {int} the depth
   */
  get depth() {
    return this.folderParentPath ? ExternalFolderEntity.splitFolderPath(this.folderParentPath).length : 0;
  }

  /*
   * ==================================================
   * Setters
   * ==================================================
   */

  /**
   * Set resource id
   * @param {string} id The resource id
   */
  set id(id) {
    const propSchema = this.cachedSchema.properties.id;
    this._props.id = EntitySchema.validateProp("id", id, propSchema);
  }

  /**
   * Set folder parent id
   * @param {string} folderParentId the folder parent id
   */
  set folderParentId(folderParentId) {
    const propSchema = this.cachedSchema.properties.folder_parent_id;
    this._props.folder_parent_id = EntitySchema.validateProp("folder_parent_id", folderParentId, propSchema);
  }

  /**
   * Set resource description
   * @params {string} description The description
   */
  set description(description) {
    const propSchema = this.cachedSchema.properties.description;
    this._props.description = EntitySchema.validateProp("description", description, propSchema);
  }

  /**
   * Set secret in clear
   * @param {string} secretClear secret in clear
   */
  set secretClear(secretClear) {
    const propSchema = this.cachedSchema.properties.secret_clear;
    this._props.secret_clear = EntitySchema.validateProp("secret_clear", secretClear, propSchema);
  }

  /**
   * Set folder parent path
   * @param {string} folderParentPath folder parent path
   */
  set folderParentPath(folderParentPath) {
    const propSchema = this.cachedSchema.properties.folder_parent_path;
    this._props.folder_parent_path = EntitySchema.validateProp("folder_parent_path", folderParentPath, propSchema);
  }

  /**
   * Move resource at a new root path
   * @param {ExternalFolderEntity} rootFolder The folder to use as root
   */
  changeRootPath(rootFolder) {
    assertType(rootFolder, ExternalFolderEntity);

    if (!this.folderParentPath.length) {
      this.folderParentPath = rootFolder.path;
    } else {
      this.folderParentPath = `${rootFolder.path}/${this.folderParentPath}`;
    }
  }

  /*
   * ==================================================
   * Other associated properties methods
   * ==================================================
   */

  /**
   * Get secrets
   * @returns {ResourceSecretsCollection|null} the secrets collection
   */
  get secrets() {
    return this._secrets || null;
  }

  /**
   * Set secrets
   * @param {ResourceSecretsCollection} secrets the secrets collection
   */
  set secrets(secrets) {
    assertType(secrets, ResourceSecretsCollection);
    this._secrets = secrets;
  }

  /**
   * Get the associated totp if any
   * @returns {ExternalTotpEntity|null}
   */
  get totp() {
    return this._totp || null;
  }

  /**
   * Set the associated totp
   * @param {ExternalTotpEntity|null} totp
   */
  set totp(totp) {
    if (totp === null) {
      this._totp = null;
      return;
    }
    assertType(totp, ExternalTotpEntity);
    this._totp = totp;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * ExternalResourceEntity.DEFAULT_RESOURCE_NAME
   * @returns {string}
   */
  static get DEFAULT_RESOURCE_NAME() {
    return DEFAULT_RESOURCE_NAME;
  }
}

export default ExternalResourceEntity;
