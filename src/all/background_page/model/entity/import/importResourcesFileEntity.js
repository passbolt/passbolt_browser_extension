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
import ExternalFoldersCollection from "../folder/external/externalFoldersCollection";
import FolderEntity from "../folder/folderEntity";
import ExternalResourcesCollection from "../resource/external/externalResourcesCollection";
import TagEntity from "../tag/tagEntity";
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = "ImportResourcesFile";
const FILE_TYPE_KDBX = "kdbx";
const FILE_TYPE_CSV = "csv";

class ImportResourcesFileEntity extends Entity {
  /**
   * Import resources file entity constructor
   *
   * @param {Object} importResourcesFileDto import resources file DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(importResourcesFileDto) {
    super(EntitySchema.validate(
      ImportResourcesFileEntity.ENTITY_NAME,
      importResourcesFileDto,
      ImportResourcesFileEntity.getSchema()
    ));
    // @todo Refactor when a schema deep testing strategy is implemented.
    if (importResourcesFileDto.options) {
      EntitySchema.validate(
        ImportResourcesFileEntity.ENTITY_NAME,
        importResourcesFileDto.options,
        ImportResourcesFileEntity.getSchema().properties.options
      );
      if (importResourcesFileDto.options.credentials) {
        EntitySchema.validate(
          ImportResourcesFileEntity.ENTITY_NAME,
          importResourcesFileDto.options.credentials,
          ImportResourcesFileEntity.getSchema().properties.options.properties.credentials
        );
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
          "format": "x-base64"
        },
        "file_type": {
          "type": "string",
          "enum": ImportResourcesFileEntity.SUPPORTED_FILE_TYPES
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
                  "anyOf": [{
                    "type": "string",
                  }, {
                    "type": "null"
                  }]
                },
                "keyfile": {
                  "anyOf": [{
                    "type": "string",
                    "format": "x-base64"
                  }, {
                    "type": "null"
                  }]
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
   * @returns {*}
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
   * Get import options
   * @returns {string} the file encrypted in base64
   */
  get options() {
    return this._props.options || {};
  }

  /**
   * Must import folders
   * @returns {boolean}
   */
  get mustImportFolders() {
    return this.options.folders || false;
  }

  /**
   * Must tag resources
   * @returns {boolean}
   */
  get mustTag() {
    return this.options.tags || false;
  }

  /**
   * get credentials if any
   * @returns {boolean}
   */
  get credentials() {
    return this.options.credentials || {};
  }

  /**
   * Get the password protecting the file
   * @returns {boolean}
   */
  get password() {
    return this.credentials.password;
  }

  /**
   * Get the keyfile protecting the file
   * @returns {boolean}
   */
  get keyfile() {
    return this.credentials.keyfile;
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
    if (folder !== null && !(folder instanceof FolderEntity)) {
      throw new TypeError('The reference folder should be a valid FolderEntity');
    }
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
    if (tag !== null && !(tag instanceof TagEntity)) {
      throw new TypeError('The reference tag should be a valid TagEntity');
    }
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
    if (!(externalResourcesCollection instanceof ExternalResourcesCollection)) {
      throw new TypeError("importResources must be a valid ImportResourcesCollection instance");
    }
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
    if (!(importFoldersCollection instanceof ExternalFoldersCollection)) {
      throw new TypeError("importFolders must be a valid ExternalFoldersCollection instance");
    }
    this._import_folders = importFoldersCollection;
  }

  /**
   * Get the list of resources errors
   * @returns {array}
   */
  get importResourcesErrors() {
    return this._import_resources_errors;
  }

  /**
   * Set the list of resources errors
   * @param {array} collection The collection of errors
   */
  set importResourcesErrors(errors) {
    if (Array.isArray(errors)) {
      throw new TypeError("importResourcesErrors must be a valid array");
    }
    this._import_resources_errors = errors;
  }

  /**
   * Get the list of folders errors
   * @returns {array}
   */
  get importFoldersErrors() {
    return this._import_folders_errors;
  }

  /**
   * Set the list of folders errors
   * @param {array} collection The list of errors
   */
  set importFoldersErrors(errors) {
    if (Array.isArray(errors)) {
      throw new TypeError("importFoldersErrors must be a valid array");
    }
    this._import_folders_errors = errors;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */

  /**
   * ImportResourcesFileEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * ImportResourcesFileEntity.SUPPORTED_FILE_TYPES
   * @returns {array<string>}
   */
  static get SUPPORTED_FILE_TYPES() {
    return [
      ImportResourcesFileEntity.FILE_TYPE_CSV,
      ImportResourcesFileEntity.FILE_TYPE_KDBX,
    ];
  }

  /**
   * ImportResourcesFileEntity.FILE_TYPE_CSV
   * @returns {string}
   */
  static get FILE_TYPE_CSV() {
    return FILE_TYPE_CSV;
  }

  /**
   * ImportResourcesFileEntity.FILE_TYPE_CSV
   * @returns {string}
   */
  static get FILE_TYPE_KDBX() {
    return FILE_TYPE_KDBX;
  }
}

export default ImportResourcesFileEntity;
