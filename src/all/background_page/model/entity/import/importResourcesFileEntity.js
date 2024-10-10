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
import EntityV2 from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2";
import ExternalFoldersCollection from "../folder/external/externalFoldersCollection";
import FolderEntity from "../folder/folderEntity";
import ExternalResourcesCollection from "../resource/external/externalResourcesCollection";
import TagEntity from "../tag/tagEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import {assertType} from "../../../utils/assertions";

const FILE_TYPE_KDBX = "kdbx";
const FILE_TYPE_CSV = "csv";

const SUPPORTED_FILE_TYPES = [
  FILE_TYPE_CSV,
  FILE_TYPE_KDBX,
];

class ImportResourcesFileEntity extends EntityV2 {
  /**
   * @inheritDoc
   */
  constructor(dto, options = {}) {
    super(dto, options);
    // @todo Refactor when a schema deep testing strategy is implemented.
    if (this._props.options) {
      const optionsSchema = this.cachedSchema.properties.options;
      this._props.options = EntitySchema.validate(this.constructor.name, this._props.options, optionsSchema);
      if (dto.options.credentials) {
        this._props.options.credentials = EntitySchema.validate(this.constructor.name, this._props.options.credentials, optionsSchema.properties.credentials);
      }
    }

    this._import_resources = new ExternalResourcesCollection([]);
    this._import_folders = new ExternalFoldersCollection([]);
    this._import_resources_errors = [];
    this._import_folders_errors = [];
  }

  /**
   * Get entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "ref",
        "file",
        "file_type"
      ],
      "properties": {
        "ref": {
          "type": "string",
          "pattern": /^[a-zA-Z0-9\-_]*$/
        },
        "file": {
          "type": "string",
          //@todo replace with pattern check instead
          "format": "x-base64"
        },
        "file_type": {
          "type": "string",
          "enum": SUPPORTED_FILE_TYPES
        },
        "options": {
          "type": "object",
          "required": [],
          "properties": {
            "folders": {
              "type": "boolean"
            },
            "tags": {
              "type": "boolean"
            },
            "credentials": {
              "type": "object",
              "required": [],
              "properties": {
                "password": {
                  "type": "string",
                  "nullable": true,
                },
                "keyfile": {
                  "type": "string",
                  "format": "x-base64",
                  "nullable": true,
                }
              }
            }
          }
        }
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
   * @returns {{references: {folder: (object|null), tag: (object|null)}, created: {resourcesCount: int, foldersCount: int}, options: {folders: boolean, tags: boolean}, errors: {folders: array, resources: array}}}
   */
  toDto() {
    return {
      created: {
        resourcesCount: this.importResources.items.filter(importResource => importResource.id).length,
        foldersCount: this.importFolders.items.filter(importFolder => importFolder.id).length
      },
      errors: {
        resources: this.importResourcesErrors.map(importResourceError => importResourceError.toJSON()),
        folders: this.importFoldersErrors.map(importFolderError => importFolderError.toJSON())
      },
      options: {
        folders: this.mustImportFolders,
        tags: this.mustTag
      },
      references: {
        folder: this.referenceFolder ? this.referenceFolder.toJSON() : null,
        tag: this.referenceTag ? this.referenceTag.toJSON() : null
      }
    };
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {{references: {folder: (object|null), tag: (object|null)}, created: {resourcesCount: int, foldersCount: int}, options: {folders: boolean, tags: boolean}, errors: {folders: array, resources: array}}}
   */
  toJSON() {
    return this.toDto();
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */

  /**
   * Get the import reference
   * @returns {string} ref ie. import-202008081200
   */
  get ref() {
    return this._props.ref;
  }

  /**
   * Get import file
   * @returns {string} the file encrypted in base64
   */
  get file() {
    return this._props.file;
  }

  /**
   * Get import file type
   * @returns {string}
   */
  get fileType() {
    return this._props.file_type;
  }

  /**
   * Must import folders
   * @returns {boolean}
   */
  get mustImportFolders() {
    return Boolean(this._props.options?.folders);
  }

  /**
   * Must tag resources
   * @returns {boolean}
   */
  get mustTag() {
    return Boolean(this._props.options?.tags);
  }

  /**
   * Get the password protecting the file
   * @returns {string|null}
   */
  get password() {
    return this._props.options?.credentials?.password ?? null;
  }

  /**
   * Get the keyfile protecting the file
   * @returns {string|null}
   */
  get keyfile() {
    return this._props.options?.credentials?.keyfile ?? null;
  }

  /*
   * ==================================================
   * Calculated properties
   * ==================================================
   */

  /**
   * Get the reference folder
   * @returns {FolderEntity|null}
   */
  get referenceFolder() {
    return this._referenceFolder || null;
  }

  /**
   * Set the reference folder
   * @param {FolderEntity} folder The folder entity
   */
  set referenceFolder(folder) {
    assertType(folder, FolderEntity);
    this._referenceFolder = folder;
  }

  /**
   * Get the reference tag
   * @returns {TagEntity|null}
   */
  get referenceTag() {
    return this._referenceTag || null;
  }

  /**
   * Set the reference tag
   * @param {TagEntity} tag The tag entity
   */
  set referenceTag(tag) {
    assertType(tag, TagEntity);
    this._referenceTag = tag;
  }

  /*
   * ==================================================
   * Associated properties getters / setters
   * ==================================================
   */

  /**
   * Get the collection of resources to import
   * @returns {ExternalResourcesCollection}
   */
  get importResources() {
    return this._import_resources;
  }

  /**
   * Set the collection of resources to import
   * @param {ExternalResourcesCollection} externalResourcesCollection The collection of resources to import
   */
  set importResources(externalResourcesCollection) {
    assertType(externalResourcesCollection, ExternalResourcesCollection);
    this._import_resources = externalResourcesCollection;
  }

  /**
   * Get the collection of folders to import
   * @returns {ExternalFoldersCollection}
   */
  get importFolders() {
    return this._import_folders;
  }

  /**
   * Set the collection of folders to import
   * @param {ExternalFoldersCollection} importFoldersCollection The collection of folders to import
   */
  set importFolders(importFoldersCollection) {
    assertType(importFoldersCollection, ExternalFoldersCollection);
    this._import_folders = importFoldersCollection;
  }

  /**
   * Get the list of resources errors
   * @returns {array<ImportError>}
   */
  get importResourcesErrors() {
    return this._import_resources_errors;
  }

  /**
   * Get the list of folders errors
   * @returns {array<ImportError>}
   */
  get importFoldersErrors() {
    return this._import_folders_errors;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */

  /**
   * ImportResourcesFileEntity.SUPPORTED_FILE_TYPES
   * @returns {string}
   */
  static get SUPPORTED_FILE_TYPES() {
    return SUPPORTED_FILE_TYPES;
  }

  /**
   * ImportResourcesFileEntity.FILE_TYPE_CSV
   * @returns {string}
   */
  static get FILE_TYPE_CSV() {
    return FILE_TYPE_CSV;
  }

  /**
   * ImportResourcesFileEntity.FILE_TYPE_KDBX
   * @returns {string}
   */
  static get FILE_TYPE_KDBX() {
    return FILE_TYPE_KDBX;
  }

  /*
   * ==================================================
   * Build utils
   * ==================================================
   */

  /**
   * Build the import entity
   * @param {string} fileType The file to import type
   * @param {string} file The file to import (Encoded in base64)
   * @param {object?} options (Optional) The import options
   * @returns {ImportResourcesFileEntity}
   * @throws {FileTypeError} If the file type is not supported
   */
  static buildImportEntity(fileType, file, options) {
    const dateRef = (new Date()).toISOString()
      .split('.')[0]
      .replace(/\D/g, '');
    const importResourcesDto = {file_type: fileType, file: file, options: options, ref: `import-${dateRef}`};
    return new ImportResourcesFileEntity(importResourcesDto);
  }
}

export default ImportResourcesFileEntity;
