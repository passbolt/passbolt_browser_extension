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
import CustomFieldsCollection from "passbolt-styleguide/src/shared/models/entity/customField/customFieldsCollection";
import {SECRET_DATA_OBJECT_TYPE} from "passbolt-styleguide/src/shared/models/entity/secretData/secretDataEntity";

const DEFAULT_RESOURCE_NAME = '(no name)';
const RESOURCE_URI_MAX_LENGTH = 1024;
const RESOURCE_URIS_MAX_ITEMS = 32;

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
   *  @inheritDoc
   * @returns {{custom_fields: CustomFieldsCollection}}
   */
  static get associations() {
    return {
      custom_fields: CustomFieldsCollection,
    };
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
        "uris": {
          "type": "array",
          "items": {
            "type": "string",
            "maxLength": RESOURCE_URI_MAX_LENGTH
          },
          "maxItems": RESOURCE_URIS_MAX_ITEMS
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
        "custom_fields": {
          ...CustomFieldsCollection.getSchema(),
          "nullable": true,
        },
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

    if (this._customFields) {
      result.custom_fields = this._customFields.toDto();
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
    const data = {
      id: resourceEntityDto.id,
      name: resourceEntityDto.metadata.name,
      username: resourceEntityDto.metadata.username,
      uris: resourceEntityDto.metadata.uris || [],
      description: resourceEntityDto.metadata.description || null,
      secrets: resourceEntityDto.secrets || [],
      folder_parent_id: externalFolderParent?.id || null,
      resource_type_id: resourceEntityDto.resource_type_id,
      folder_parent_path: externalFolderParent?.path || "",
      expired: resourceEntityDto.expired || null,
      custom_fields: resourceEntityDto.metadata.custom_fields || [],
    };

    if (resourceEntityDto.metadata.icon) {
      data.icon = resourceEntityDto.metadata.icon;
    }

    return data;
  }

  /**
   * ResourceMetadataEntity.URI_MAX_LENGTH
   * @returns {number}
   */
  static get URI_MAX_LENGTH() {
    return RESOURCE_URI_MAX_LENGTH;
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
        uris: this.uris,
        description: this.description,
        resource_type_id: this.resourceTypeId,
        custom_fields: this.customFields?.toMetadataDto()
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

  /**
   * Return a secret DTO.
   * The method will inject the object_type if the associated resource type is v5.
   * @param {ResourceTypeEntity} resourceType The  associated resource type
   * return {Object}
   */
  toSecretDto(resourceType) {
    // todo comment fallback
    if (!this.resourceTypeId) {
      return this.secretClear;
    }

    const dto = {};

    // Extract password if present.
    if (this.secretClear) {
      dto.password = this.secretClear;
    }

    // Extract description if present.
    if (this.description) {
      dto.description = this.description;
    }

    // Extract totp dto if present.
    if (this.totp) {
      dto.totp = this.totp.toDto();
    }

    // Extract custom fields dto if present.
    if (this.customFields) {
      dto.custom_fields = this.customFields.toSecretDto();
    }

    if (resourceType.isV5()) {
      dto.object_type = SECRET_DATA_OBJECT_TYPE
    }

    return dto;
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
   * Get resource uris
   * @returns {string|null}
   */
  get uris() {
    return this._props.uris || [];
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

  /**
   * Get the resource icon and color information if any
   * @returns {IconEntity|null}
   */
  get icon() {
    return this._icon || null;
  }

  /**
   * Get the custom fields collection
   * @returns {CustomFieldsCollection|null}
   */
  get customFields() {
    return this._customFields || null;
  }

  /**
   * Set the custom fields
   * @param {CustomFieldsCollection|null} customFields the custom fields collection to us
   * @returns {void}
   */
  set customFields(customFields) {
    if (customFields === null) {
      this._customFields = null;
      return;
    }
    assertType(customFields, CustomFieldsCollection);
    this._customFields = customFields;
  }

  /**
   * Reset all secret props.
   *
   * Note: Used when importing resources to keep only one version of the secrets, either encrypted in the secrets
   * collection, either decrypted as props.
   *
   * Note 2: The whole custom fields props is reset, to re-evaluate when the custom field keys or values will also
   * be available in the metadata.
   */
  resetSecretProps(resourceType) {
    this.secretClear = "";
    // todo dcouemnt password string reason
    if (resourceType) {
      this.description = "";
      this.totp = null;
      this.customFields = null;
    }
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
