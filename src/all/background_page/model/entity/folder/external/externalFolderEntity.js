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
const {FolderEntity} = require("../folderEntity");
const {Entity} = require('../../abstract/entity');
const {EntitySchema} = require('../../abstract/entitySchema');
const {EntityValidationError} = require('../../abstract/entityValidationError');

const ENTITY_NAME = 'ExternalFolder';

class ExternalFolderEntity extends Entity {
  /**
   * External folder entity constructor
   *
   * @param {Object} externalFolderDto external folder DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(externalFolderDto) {
    // Default properties values
    const props = Object.assign(ExternalFolderEntity.getDefault(), externalFolderDto);

    // Sanitize
    if (typeof props.folder_parent_path == "string") {
      props.folder_parent_path = ExternalFolderEntity.sanitizePath(props.folder_parent_path);
    }

    // Validate
    super(EntitySchema.validate(
      ExternalFolderEntity.ENTITY_NAME,
      props,
      ExternalFolderEntity.getSchema()
    ));
  }

  /**
   * Get default properties values
   * @return {object}
   */
  static getDefault() {
    return {
      "folder_parent_path": ""
    }
  }

  /**
   * Get resource entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    const folderEntitySchema = FolderEntity.getSchema();
    return {
      "type": "object",
      "required": [
        "name",
      ],
      "properties": {
        "id": folderEntitySchema.properties.id,
        "name": {
          ...folderEntitySchema.properties.name,
          "pattern": /^[^\/]*$/
        },
        "folder_parent_id": folderEntitySchema.properties.folder_parent_id,
        "folder_parent_path": {
          "type": "string"
        }
      }
    }
  }

  /**
   * Create an external folder from a path
   * @param path
   * @returns {ExternalFolderEntity}
   */
  static createFromPath(path) {
    path = ExternalFolderEntity.sanitizePath(path);
    const chunks = path.split('/');
    const externalFolderDto = {
      name: chunks.pop(),
      folder_parent_path: chunks.join('/')
    };
    return new ExternalFolderEntity(externalFolderDto);
  }

  // ==================================================
  // Format / normalize
  // ==================================================

  /**
   * Normalize format path.
   * ie: my// //folder/ path -> my/folder/path
   * @param {string} path The path to normalize
   * @return {string}
   */
  static sanitizePath(path) {
    path = path || "";
    path = path.replace(/[ \/]*\/[ \/]*/g, '/') // Replace any combinations of space and / by one unique /
      .replace(/^\/*|\/*$/g, '') // Remove first and last /
      .trim() // Remove first and last spaces;
    return path;
  }

  // ==================================================
  // Serialization
  // ==================================================

  /**
   * Return a DTO ready to be sent to API
   *
   * @returns {object}
   */
  toDto() {
    return Object.assign({}, this._props);
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto();
  }

  // ==================================================
  // Dynamic properties getters / setters
  // ==================================================

  /**
   * Get folder id
   * @returns {string} uuid
   */
  get id() {
    return this._props.id || null;
  }

  /**
   * Set folder id
   * @param {string} id The folder id
   */
  set id(id) {
    this._props.id = id;
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
   * @returns {string} folder parent id
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

  /**
   * Get folder parent path
   * @returns {string} folder parent path
   */
  get folderParentPath() {
    return this._props.folder_parent_path || "";
  }

  /**
   * Set folder parent path
   * @param {string} folderParentPath folder parent path
   */
  set folderParentPath(folderParentPath) {
    this._props.folder_parent_path = folderParentPath;
  }

  // ==================================================
  // Calculated properties getters
  // ==================================================

  /**
   * Get folder path
   * @returns {(string|null)} folder path
   */
  get path() {
    return this.folderParentPath ? `${this.folderParentPath}/${this.name}` : this.name;
  }

  /**
   * Depth
   * @returns {int} the depth
   */
  get depth() {
    return this.folderParentPath ? this.folderParentPath.split('/').length : 0;
  }

  // ==================================================
  // Setters
  // ==================================================

  /**
   * Move folder at a new root
   * @param {ExternalFolderEntity} rootFolder The folder to use as root
   */
  changeRootPath(rootFolder) {
    if (!this.folderParentPath.length) {
      this.folderParentPath = rootFolder.path;
    } else {
      this.folderParentPath = `${rootFolder.path}/${this.folderParentPath}`;
    }
  }

  // ==================================================
  // Static properties getters
  // ==================================================

  /**
   * ExternalFolderEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

exports.ExternalFolderEntity = ExternalFolderEntity;
