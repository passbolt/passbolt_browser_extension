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
import FolderEntity from "./folderEntity";
import EntityV2Collection from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2Collection";
import EntityCollectionError from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollectionError";

const ENTITY_NAME = 'Folders';
const RULE_UNIQUE_ID = 'unique_id';

class FoldersCollection extends EntityV2Collection {
  /**
   * @inheritDoc
   */
  get entityClass() {
    return FolderEntity;
  }

  /**
   * @inheritDoc
   * @param {object} [options.ignoreInvalidEntity=false] Ignore invalid entities.
   * @throws {CollectionValidationError} Build Rule: Ensure all items in the collection are unique by ID.
   * @throws {CollectionValidationError} Build Rule: Ensure all items in the collection are unique by name.
   */
  constructor(dtos = [], options = {}) {
    super(dtos, options);
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
    };
  }

  /**
   * @inheritDoc
   * @param {Set} [options.uniqueIdsSetCache] A set of unique ids.
   * @throws {EntityValidationError} If a folder already exists with the same id.
   */
  validateBuildRules(item, options) {
    this.assertNotExist("id", item._props.id, {haystackSet: options?.uniqueIdsSetCache});
  }

  /*
   * ==================================================
   * Getter
   * ==================================================
   */
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

  /**
   * Return a new collection with all resources the current user is owner
   *
   * @returns {FoldersCollection}
   */
  getAllWhereOwner() {
    return new FoldersCollection(this._items.filter(f => f.isOwner()));
  }

  /**
   * Get an entity folder parent path.
   * @param {FolderEntity|ResourceEntity} entity
   * @returns {string}
   */
  getFolderParentPath(entity) {
    return this.getAllParents(entity).items
      .reverse()
      .map(folderParentEntity => folderParentEntity.name)
      .join("/");
  }

  /*
   * ==================================================
   * Finders
   * ==================================================
   */
  /**
   * Get the first item that matches the given id
   * @param {string} id
   * @returns {*} FolderEntity or undefined
   */
  getById(id) {
    const found = this._items.filter(folder => folder.id === id);
    return found.length ? found[0] : undefined;
  }

  /**
   * Find all children
   *
   * @param {string} parentId
   * @returns {FoldersCollection}
   */
  getAllChildren(parentId) {
    return FoldersCollection.getAllChildren(parentId, this, new FoldersCollection([]));
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
      } catch (error) {
        /*
         * children are already in collection
         * skip...
         */
      }
      const childrenIds = children.map(child => child.id);
      childrenIds.forEach(id => FoldersCollection.getAllChildren(id, inputCollection, outputCollection));
    }
    return outputCollection;
  }

  /**
   *
   * @param folderId
   * @returns {string}
   */
  getFolderPath(folderId) {
    if (folderId === null) {
      return '/';
    }
    const folder = this.folders.find(item => item.id === folderId);
    if (!folder) {
      let msg = `FoldersCollection::getAllParentsAsPath the folder is missing in the inputCollection.`;
      msg += `(id: ${folderId})`;
      throw new Error(msg);
    }
    const parents = this.getAllParents(folder);
    parents.unshift(folder);
    return `/${(parents.folders.map(folder => folder.name)).reverse().join('/')}`;
  }

  /**
   * Find all parent
   *
   * @param {FolderEntity} folder
   * @returns {FoldersCollection}
   */
  getAllParents(folder) {
    return FoldersCollection.getAllParents(folder, this, new FoldersCollection([]));
  }

  /**
   * Recursive parent find for a given folder and a collection of folders
   *
   * @param {FolderEntity} folder
   * @param {FoldersCollection} inputCollection
   * @param {FoldersCollection} outputCollection carried forward
   * @returns {FoldersCollection} outputCollection final
   */
  static getAllParents(folder, inputCollection, outputCollection) {
    if (folder.folderParentId !== null) {
      const parent = inputCollection.folders.find(item => item.id === folder.folderParentId);
      if (parent !== undefined) {
        outputCollection.push(parent);
        FoldersCollection.getAllParents(parent, inputCollection, outputCollection);
      }
    }
    return outputCollection;
  }

  /*
   * ==================================================
   * Setters
   * ==================================================
   */
  /**
   * @inheritDoc
   * This method creates caches of unique ids to improve the build rules performance.
   */
  pushMany(data, entityOptions = {}, options = {}) {
    const uniqueIdsSetCache = new Set(this.extract("id"));
    const onItemPushed = item => {
      uniqueIdsSetCache.add(item.id);
    };

    options = {
      onItemPushed: onItemPushed,
      validateBuildRules: {...options?.validateBuildRules, uniqueIdsSetCache},
      ...options
    };

    super.pushMany(data, entityOptions, options);
  }

  /**
   * Merge another set of folders in this collection
   * @param {FoldersCollection} foldersCollection
   * @returns {FoldersCollection}
   */
  merge(foldersCollection) {
    for (const folder of foldersCollection) {
      try {
        this.push(folder);
      } catch (error) {}
    }
    return this;
  }

  /*
   * ==================================================
   * Asserts
   * ==================================================
   */
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
    for (; i < length; i++) {
      const existingFolder = this.folders[i];
      if (existingFolder.id && existingFolder.id === folderEntity.id) {
        throw new EntityCollectionError(i, FoldersCollection.RULE_UNIQUE_ID, `Folder id ${folderEntity.id} already exists.`);
      }
    }
  }
}

export default FoldersCollection;
