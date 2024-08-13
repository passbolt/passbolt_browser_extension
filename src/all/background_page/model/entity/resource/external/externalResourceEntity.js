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
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import ResourceSecretsCollection from "../../secret/resource/resourceSecretsCollection";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import TotpEntity from "../../totp/totpEntity";
import ResourceMetadataEntity from "../metadata/resourceMetadataEntity";

const ENTITY_NAME = 'ExternalResource';
const DEFAULT_RESOURCE_NAME = '(no name)';

class ExternalResourceEntity extends Entity {
  /**
   * @inheritDoc
   * Sanitize:
   * - Override default data using the data provided in the DTO.
   * - Normalize the folder parent path, see ExternalFolderEntity::sanitizePath
   * @throws {EntityValidationError} Build Rule: The collection of secrets cannot be empty.
   * @throws {EntityValidationError} Build Rule: Verify that the secrets associated resource ID corresponds with the
   * resource ID.
   */
  constructor(externalResourceDto, options = {}) {
    // Default properties values
    const props = Object.assign(ExternalResourceEntity.getDefault(), externalResourceDto);

    // Sanitize
    if (typeof props.folder_parent_path == "string") {
      props.folder_parent_path = ExternalFolderEntity.sanitizePath(props.folder_parent_path);
    }

    // Validate
    super(EntitySchema.validate(
      ExternalResourceEntity.ENTITY_NAME,
      props,
      ExternalResourceEntity.getSchema()
    ), options);

    // Associations
    if (this._props.secrets) {
      this._secrets = new ResourceSecretsCollection(this._props.secrets, {clone: false});
      ResourceEntity.assertValidSecrets(this._secrets, this.id);
      delete this._props.secrets;
    }
  }

  /**
   * Get default properties values
   * @return {object}
   */
  static getDefault() {
    return {
      "name": ExternalResourceEntity.DEFAULT_RESOURCE_NAME,
      "secret_clear": "",
      "folder_parent_path": ""
    };
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
        "totp": TotpEntity.getSchema(),
        "folder_parent_path": {
          "type": "string"
        },
        "expired": resourceEntitySchema.properties.expired,
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
    return result;
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto();
  }

  /**
   * Builds from a resource entity DTO an external resource entity DTO.
   * @param {object} resourceEntityDto
   * @param {ExternalFolderEntity} [externalFolderParent]
   * @returns {object}
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
      resource_type_id: resourceEntityDto.metadata.resource_type_id,
      folder_parent_path: externalFolderParent?.path || "",
      expired: resourceEntityDto.expired || null,
    };
  }

  /**
   * Returns a Resource DTO in v5 format.
   * @returns {object}
   */
  toResourceEntityDto() {
    return {
      id: this.id,
      metadata: {
        object_type: ResourceMetadataEntity.METADATA_OBJECT_TYPE,
        name: this.name,
        username: this.username,
        uris: [this.uri],
        description: this.description,
        resource_type_id: this.resourceTypeId,
      },
      secrets: this._secrets.toDto(),
      folder_parent_id: this.folderParentId,
      resource_type_id: this.resourceTypeId,
      expired: this.expired,
    };
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */

  /**
   * Get resource id
   * @returns {string}
   */
  get id() {
    return this._props.id || null;
  }

  /**
   * Set resource id
   * @param {string} id The resource id
   */
  set id(id) {
    this._props.id = id;
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
   * @returns {string}
   */
  get username() {
    return this._props.username;
  }

  /**
   * Get resource uri
   * @returns {string}
   */
  get uri() {
    return this._props.uri;
  }

  /**
   * Get resource description
   * @returns {string}
   */
  get description() {
    return this._props.description;
  }

  /**
   * Set resource description
   * @params {string} description The description
   */
  set description(description) {
    this._props.description = description;
  }

  /**
   * Get secret in clear
   * @returns {string} secret in clear
   */
  get secretClear() {
    return this._props.secret_clear;
  }

  /**
   * Set secret in clear
   * @param {string} secretClear secret in clear
   */
  set secretClear(secretClear) {
    this._props.secret_clear = secretClear;
  }

  /**
   * Get folder parent id
   * @returns {string|null}
   */
  get folderParentId() {
    return this._props.folder_parent_id || null;
  }

  /**
   * Set folder parent id
   * @param {string} folderParentId the folder parent id
   */
  set folderParentId(folderParentId) {
    this._props.folder_parent_id = folderParentId;
  }

  get totp() {
    return this._props.totp;
  }

  set totp(totp) {
    this._props.totp = totp;
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
   * @returns {(string|null)} uuid
   */
  get resourceTypeId() {
    return this._props.resource_type_id || null;
  }

  /**
   * Get the resource type if any
   * @returns {(string|null)} uuid
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
   * Set folder parent path
   * @param {string} folderParentPath folder parent path
   */
  set folderParentPath(folderParentPath) {
    this._props.folder_parent_path = folderParentPath;
  }

  /**
   * Move resource at a new root path
   * @param {ExternalFolderEntity} rootFolder The folder to use as root
   */
  changeRootPath(rootFolder) {
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
   * @returns {ResourceSecretsCollection} the secrets collection
   */
  get secrets() {
    return this._secrets;
  }

  /**
   * Set secrets
   * @param {ResourceSecretsCollection} secrets the secrets collection
   */
  set secrets(secrets) {
    if (!(secrets instanceof ResourceSecretsCollection)) {
      throw new EntityValidationError('ExternalResourceEntity secrets expect a ResourceSecretsCollection.');
    }
    this._secrets = secrets;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * ExternalResourceEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * ExternalResourceEntity.DEFAULT_RESOURCE_NAME
   * @returns {string}
   */
  static get DEFAULT_RESOURCE_NAME() {
    return DEFAULT_RESOURCE_NAME;
  }
}

export default ExternalResourceEntity;
