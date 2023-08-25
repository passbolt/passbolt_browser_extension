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
import FolderEntity from "../folderEntity";
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";


const ENTITY_NAME = 'ExternalFolder';

class ExternalFolderEntity extends Entity {
  /**
   * External folder entity constructor
   *
   * @param {Object} externalFolderDto external folder DTO
   * @throws {EntityValidationError} if the dto cannot be converted into an entity
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
    };
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
        "name": folderEntitySchema.properties.name,
        "folder_parent_id": folderEntitySchema.properties.folder_parent_id,
        "folder_parent_path": {
          "type": "string"
        }
      }
    };
  }

  /**
   * Create an external folder from a path
   * @param path
   * @returns {ExternalFolderEntity}
   */
  static createFromPath(path) {
    path = ExternalFolderEntity.sanitizePath(path);
    const chunks = ExternalFolderEntity.splitFolderPath(path);
    const externalFolderDto = {
      name: chunks.pop(),
      folder_parent_path: chunks.join('/')
    };
    return new ExternalFolderEntity(externalFolderDto);
  }

  /*
   * ==================================================
   * Format / normalize
   * ==================================================
   */

  /**
   * Normalize format path.
   * ie: my// //folder/ path -> my/folder/path
   * @param {string} path The path to normalize
   * @return {string}
   */
  static sanitizePath(path) {
    path = path || "";
    return path
      .replace(/^(\/{2,})|(\/{2,})$/g, '/') //replace any group of starting or ending slash by a single slash
      .replace(/^(\/(?! ))|((?<! )\/)$/g, '') //remove starting '/' not followed by a space or an ending '/' not preceded by a space
      .replace(/(?<! )(\/{2,})(?! )/g, '/'); //replace any group of multiple / that are not prefixed or suffixed by a space
  }

  /**
   * Split folder path while considering a non separator regex.
   * The non separator is ' / ' expecting that this is the one used while importing or exporting resources.
   * ie: root/path/un / splittedPath => ['root', 'path', 'un/splittedPath']
   * @param {string} path The path to split
   * @return {array<string>}
   */
  static splitFolderPath(path) {
    return path.split(/(?<! )\/(?! )/g);
  }

  /**
   * Escape a folder name by adding spaces around slashes to escape them and not confuse them with a directory separator.
   * A trim is applied to avoid issues with folder export/import when they by ' /'.
   * @param {string} name
   */
  static escapeName(name) {
    name = name || "";
    return name
      .trim()
      .replace(/^\//, '/ ') // replace a starting '/' by '/ '
      .replace(/\/$/, ' /') // replace an ending '/' by ' /'
      .replace(/(.)\/(.)/g, '$1 / $2'); //replace all "middle" '/' by ' / '
  }

  /**
   * Removes the extra spaces in a folder name that are added to differentiate slashes between directory seperator from the ones part of the name.
   * ie: '/ folder' => '/folder'
   * ie: 'folder /' => 'folder/'
   * ie: 'fol / der' => 'fol/der'
   * @param {string} name The name from where to remove extra spaces
   * @return {string}
   */
  static resolveEscapedName(name) {
    name = name || "";
    return name.replace(/ \/ | \/|\/ /g, '/'); //replace any ' / ', ' /', '/ ' (slash with spaces) by a single '/'
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
    return Object.assign({}, this._props);
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
   * Dynamic properties getters / setters
   * ==================================================
   */

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

  /*
   * ==================================================
   * Calculated properties getters
   * ==================================================
   */

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
    return this.folderParentPath ? ExternalFolderEntity.splitFolderPath(this.folderParentPath).length : 0;
  }

  /*
   * ==================================================
   * Setters
   * ==================================================
   */

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

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */

  /**
   * ExternalFolderEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default ExternalFolderEntity;
