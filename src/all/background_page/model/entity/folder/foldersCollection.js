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
const {EntityCollection} = require('../abstract/entityCollection');
const {EntityCollectionError} = require('../abstract/entityCollectionError');
const {EntitySchema} = require('../abstract/entitySchema');
const {FolderEntity} = require('./folderEntity');

const ENTITY_NAME = 'Folders';
const RULE_UNIQUE_ID = 'unique_id';

class FoldersCollection extends EntityCollection {
  /**
   * Folders Entity constructor
   *
   * @param {Object} foldersCollectionDto folder DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(foldersCollectionDto) {
    super(EntitySchema.validate(
      FoldersCollection.ENTITY_NAME,
      foldersCollectionDto,
      FoldersCollection.getSchema()
    ));

    // Note: there is no "multi-item" validation
    // Collection validation will fail at the first item that doesn't validate
    this._props.forEach(folder => {
      this.push(new FolderEntity(folder));
    });

    // We do not keep original props
    this._props = null;
  }

  /**
   * Get folders entity schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": FolderEntity.getSchema(),
    }
  }

  // ==================================================
  // Serialization
  // ==================================================
  /**
   * Return a DTO ready to be sent to API
   *
   * @param {object} [contain] optional
   * @returns {object}
   */
  toDto(contain) {
    const result = [];
    for(let folder of this) {
      result.push(folder.toDto(contain))
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

  // ==================================================
  // Getter
  // ==================================================
  /**
   * FoldersCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * FoldersCollection.RULE_UNIQUE_ID
   * @returns {string}
   */
  static get RULE_UNIQUE_ID() {
    return RULE_UNIQUE_ID;
  }

  /**
   * Get folders
   * @returns {Array<FolderEntity>}
   */
  get folders() {
    return this._items;
  }

  /**
   * Get all the ids of the folders in the collection
   * @returns {Array} of ids
   */
  get ids() {
    return this._items.map(folder => folder.id);
  }

  /**
   * Get all the folderParentIds of the folders in the collection
   * @returns {Array} of ids
   */
  get folderParentIds() {
    return this._items.map(folder => folder.folderParentIds);
  }

  // ==================================================
  // Finders
  // ==================================================
  /**
   * Get the first item that matches the given id
   * @param {string} id
   * @returns {*} FolderEntity or undefined
   */
  getById(id) {
    let found = this._items.filter(folder => folder.id === id);
    return found.length ? found[0] : undefined;
  }

  /**
   * Find all children
   *
   * @param {string} parentId
   * @returns {FoldersCollection}
   */
  getAllChildren(parentId) {
    return FoldersCollection.getAllChildren(parentId, this, new FoldersCollection([]))
  }

  /**
   * Recursive find by parent id
   *
   * @param {string} parentId
   * @param {FoldersCollection} inputCollection
   * @param {FoldersCollection} outputCollection carried forward
   * @returns {FoldersCollection} outputCollection final
   */
  static getAllChildren(parentId, inputCollection, outputCollection) {
    const children = inputCollection.folders.filter(item => item.folderParentId === parentId);
    if (children.length) {
      try {
        children.forEach(child => outputCollection.push(child));
      } catch(error) {
        // children are already in collection
        // skip...
      }
      const childrenIds = children.map(child => child.id);
      childrenIds.forEach(id => FoldersCollection.getAllChildren(id, inputCollection, outputCollection));
    }
    return outputCollection;
  }

  // ==================================================
  // Setters
  // ==================================================
  /**
   * Push a copy of the folder to the list
   * @param {object} folder DTO or FolderEntity
   */
  push(folder) {
    if (!folder || typeof folder !== 'object') {
      throw new TypeError(`FoldersCollection push parameter should be an object.`);
    }
    if (folder instanceof FolderEntity) {
      folder = folder.toDto(FolderEntity.ALL_CONTAIN_OPTIONS); // deep clone
    }
    let folderEntity = new FolderEntity(folder); // validate

    // Build rules
    // Only one folder id instance
    this.assertUniqueId(folderEntity);

    super.push(folderEntity);
  }

  /**
   * Assert there is no other permission with the same id in the collection
   *
   * @param {FolderEntity} folderEntity
   * @throws {EntityValidationError} if a permission with the same id already exist
   */
  assertUniqueId(folderEntity) {
    if (!folderEntity.id) {
      return;
    }
    const length = this.folders.length;
    let i = 0;
    for(; i < length; i++) {
      let existingFolder = this.folders[i];
      if (existingFolder.id && existingFolder.id === folderEntity.id) {
        throw new EntityCollectionError(i, FoldersCollection.RULE_UNIQUE_ID, `Folder id ${folderEntity.id} already exists.`);
      }
    }
  }
}

exports.FoldersCollection = FoldersCollection;
