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
import EntityV2Collection from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2Collection";
import FoldersCollection from "../foldersCollection";
import ExternalFolderEntity from "./externalFolderEntity";
import {assertType} from "../../../../utils/assertions";

class ExternalFoldersCollection extends EntityV2Collection {
  /**
   * @inheritDoc
   */
  get entityClass() {
    return ExternalFolderEntity;
  }

  /**
   * Get resources entity schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": ExternalFolderEntity.getSchema(),
    };
  }

  /**
   * Construct an ExternalFoldersCollection from a folders collection.
   * All path will be relative to the elements present in the collection.
   * i.e. A folder which has a parent not present in the collection will be considered at the root of the collection
   * @param {FoldersCollection} foldersCollection
   * @returns {ExternalFoldersCollection}
   */
  static constructFromFoldersCollection(foldersCollection) {
    assertType(foldersCollection, FoldersCollection);

    const externalFoldersDto = foldersCollection.folders.map(folderEntity => {
      const folderParentPath = ExternalFoldersCollection.getEscapedFolderParentPath(foldersCollection, folderEntity);
      const folderParentId = folderParentPath.length ? folderEntity.folderParentId : null;
      return Object.assign(folderEntity.toDto(), {
        name: ExternalFolderEntity.escapeName(folderEntity.name),
        folder_parent_id: folderParentId,
        folder_parent_path: folderParentPath});
    });
    return new ExternalFoldersCollection(externalFoldersDto);
  }

  /**
   * Get the escaped folder parent path for a given FolderEntity.
   *
   * @param {FoldersCollection} foldersCollection
   * @param {FolderEntity} folderEntity
   * @returns {string}
   * @private
   */
  static getEscapedFolderParentPath(foldersCollection, folderEntity) {
    return foldersCollection.getAllParents(folderEntity).items
      .reverse()
      .map(folderParentEntity => ExternalFolderEntity.escapeName(folderParentEntity.name))
      .join("/");
  }

  /**
   * Builds a folderCollection based on an array of ExternalFolderEntity.
   * ExternalFolderEntity has name escaped while FolderEntity doesn't have.
   * So, this method ensure that FolderEntity have its name resolved from the ExternalFolderEntity.
   *
   * @param {array<ExternalFolderEntity>} externalFoldersCollection
   * @returns {FoldersCollection}
   */
  static toFoldersCollection(externalFoldersCollection) {
    const foldersCollectionDto = [];
    externalFoldersCollection.forEach(externalFolder => {
      const folderDto = Object.assign(externalFolder.toDto(), {
        name: ExternalFolderEntity.resolveEscapedName(externalFolder.name),
      });
      foldersCollectionDto.push(folderDto);
    });
    return new FoldersCollection(foldersCollectionDto);
  }

  /*
   * ==================================================
   * Finders / Filters
   * ==================================================
   */

  /**
   * Check if a folder external of the list has the given path.
   * @param {string} path The path to check for
   * @returns {boolean}
   */
  hasPath(path) {
    path = ExternalFolderEntity.sanitizePath(path);
    return this._items.some(externalFolderEntity => externalFolderEntity.path === path);
  }

  /**
   * Get external folder by id
   * @param {string} id The external folder id
   * @return {ExternalFolderEntity|null}
   */
  getById(id) {
    return this._items.find(externalFolderEntity => externalFolderEntity.id === id) || null;
  }

  /**
   * Get external folders by depth
   * @param {number} depth The depth
   * @return {array<ExternalFolderEntity>}
   */
  getByDepth(depth) {
    return this._items.filter(externalFolderEntity => externalFolderEntity.depth === depth);
  }

  /**
   * Get external folder by path
   * @param {string} path The path
   * @return {ExternalFolderEntity|null}
   */
  getByPath(path) {
    return this._items.find(externalFolderEntity => externalFolderEntity.path === path) || null;
  }

  /**
   * Get external folders by folder parent id
   * @param {string} folderParentId The folder parent id
   * @return {array<ExternalFolderEntity>}
   */
  getByFolderParentId(folderParentId) {
    if (!folderParentId) {
      return [];
    }
    return this._items.filter(externalFolderEntity => externalFolderEntity.folderParentId === folderParentId);
  }

  /*
   * ==================================================
   * Setters
   * ==================================================
   */

  /**
   * Create and push folders from path.
   * i.e. If the collection already contains a folder1 at the root. Pushing the path
   * folder1/folder2 will create the entity folder2 with folder1 as folder parent path
   * and push it to the collection.
   * @param {string} path The path
   */
  pushFromPath(path) {
    path = ExternalFolderEntity.sanitizePath(path);
    if (!path.length) {
      return;
    }

    const externalFoldersEntities = [];
    const split = ExternalFolderEntity.splitFolderPath(path);
    let pathCursor = "";
    for (const folderName of split) {
      pathCursor = pathCursor.length ? `${pathCursor}/${folderName}` : folderName;
      if (this.hasPath(pathCursor)) {
        continue;
      }
      const externalFolderEntity = ExternalFolderEntity.createFromPath(pathCursor);
      externalFoldersEntities.push(externalFolderEntity);
    }

    // If no error, persist the folders in the collection.
    this.pushMany(externalFoldersEntities);
  }

  /**
   * Set the folder parent id of the resources having the given path
   * @param {string} folderParentPath The folder parent path
   * @param {string} folderParentId The corresponding folder parent id
   */
  setFolderParentIdsByPath(folderParentPath, folderParentId) {
    for (const externalFolderEntity of this._items) {
      if (externalFolderEntity.folderParentPath === folderParentPath) {
        externalFolderEntity.folderParentId = folderParentId;
      }
    }
  }

  /**
   * Move folders at a new root path
   * @param {ExternalFolderEntity} rootFolder The folder to use as root
   */
  changeRootPath(rootFolder) {
    this._items.forEach(folder => folder.changeRootPath(rootFolder));
  }

  /**
   * Remove all the folders from the collection that are in the given path
   * @param {string} path the path to remove
   */
  removeByPath(path) {
    for (let i = this._items.length - 1; i >= 0; i--) {
      const externalFolderEntity = this._items[i];
      const escapedPath = path.replace(/[.*+\-?^${}()|[\]\\\/]/g, '\\$&');
      const regex = new RegExp(`^${escapedPath}($|\/)`);
      if (regex.exec(externalFolderEntity.path)) {
        this._items.splice(i, 1);
      }
    }
  }
}

export default ExternalFoldersCollection;
