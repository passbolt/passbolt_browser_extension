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
import FoldersCollection from "../foldersCollection";
import ExternalFolderEntity from "./externalFolderEntity";
import EntityCollection from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollection";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";


const ENTITY_NAME = 'ExternalFolders';

class ExternalFoldersCollection extends EntityCollection {
  /**
   * ExternalFoldersCollection constructor
   *
   * @param {array} externalFoldersCollectionDto external folders DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(externalFoldersCollectionDto) {
    super(EntitySchema.validate(
      ExternalFoldersCollection.ENTITY_NAME,
      externalFoldersCollectionDto,
      ExternalFoldersCollection.getSchema()
    ));

    /*
     * Note: there is no "multi-item" validation
     * Collection validation will fail at the first item that doesn't validate
     */
    this._props.forEach(externalFolderDto => {
      this.push(new ExternalFolderEntity(externalFolderDto));
    });

    // We do not keep original props
    this._props = null;
  }

  /**
   * Construct from a folders collection.
   * All path will be relative to the elements present in the collection.
   * i.e. A folder which has a parent not present in the collection will be considered at the root of the collection
   * @param foldersCollection
   * @returns {ExternalFoldersCollection}
   */
  static constructFromFoldersCollection(foldersCollection) {
    if (!(foldersCollection instanceof FoldersCollection)) {
      throw new TypeError(`ExternalFoldersCollection constructFromFoldersCollection parameter should be an instance of FoldersCollection.`);
    }
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
   * Get the escaped folder parent path for a given FolderEntity.
   *
   * @param {FoldersCollection} foldersCollection
   * @param {FolderEntity} folderEntity
   * @returns {string}
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
    const foldersCollection = [];
    externalFoldersCollection.forEach(externalFolder => {
      const folderDto = Object.assign(externalFolder.toDto(), {
        name: ExternalFolderEntity.resolveEscapedName(externalFolder.name),
      });
      foldersCollection.push(folderDto);
    });
    return new FoldersCollection(foldersCollection);
  }

  /**
   * Get external folders
   * @returns {Array<ExternalFolderEntity>}
   */
  get externalFolders() {
    return this._items;
  }

  /**
   * Get all the ids of the folders in the collection
   * @returns {Array<string>}
   */
  get ids() {
    return this._items.map(r => r.id);
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
    return this.externalFolders.some(externalFolderEntity => externalFolderEntity.path === path);
  }

  /**
   * Get external folder by id
   * @param {string} id The folder id
   * @return {ExternalFolderEntity|null}
   */
  getById(id) {
    return this.externalFolders.find(externalFolderEntity => externalFolderEntity.id === id);
  }

  /**
   * Get external folders by depth
   * @param {int} depth The depth
   * @return {array}
   */
  getByDepth(depth) {
    return this.externalFolders.filter(externalFolderEntity => externalFolderEntity.depth === depth);
  }

  /**
   * Get external folder by path
   * @param {string} path The path
   * @return {ExternalFolderEntity|null}
   */
  getByPath(path) {
    return this.externalFolders.find(externalFolderEntity => externalFolderEntity.path === path);
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
    return this.externalFolders.filter(externalFolderEntity => externalFolderEntity.folderParentId === folderParentId);
  }

  /*
   * ==================================================
   * Setters
   * ==================================================
   */
  /**
   * Push a copy of the external folder to the list
   * @param {object} externalFolder DTO or ExternalFolderEntity
   */
  push(externalFolder) {
    if (!externalFolder || typeof externalFolder !== 'object') {
      throw new TypeError(`ExternalFoldersCollection push parameter should be an object.`);
    }
    if (externalFolder instanceof ExternalFolderEntity) {
      externalFolder = externalFolder.toDto(); // deep clone
    }
    const externalFolderEntity = new ExternalFolderEntity(externalFolder); // validate

    return super.push(externalFolderEntity);
  }

  /**
   * Create and push folders from path.
   * i.e. If the collection already contains a folder1 at the root. Pushing the path
   * folder1/folder2 will create the entity folder2 with folder1 as folder parent path
   * and push it to the collection.
   * @param {string} path The path
   */
  pushFromPath(path) {
    const externalFoldersEntities = [];
    path = ExternalFolderEntity.sanitizePath(path);
    if (!path.length) {
      return;
    }
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
    externalFoldersEntities.forEach(externalFolderEntity => this.push(externalFolderEntity));
  }

  /**
   * Set the folder parent id of the resources having the given path
   * @param {string} folderParentPath The folder parent path
   * @param {string} folderParentId The corresponding folder parent id
   */
  setFolderParentIdsByPath(folderParentPath, folderParentId) {
    for (const externalFolderEntity of this.externalFolders) {
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
    this.externalFolders.forEach(folder => folder.changeRootPath(rootFolder));
  }

  /**
   * Remove all the folders from the collection that are in the given path
   * @param {string} path the path to remove
   */
  removeByPath(path) {
    for (let i = this.externalFolders.length - 1; i >= 0; i--) {
      const externalFolderEntity = this.externalFolders[i];
      const escapedPath = path.replace(/[.*+\-?^${}()|[\]\\\/]/g, '\\$&');
      const regex = new RegExp(`^${escapedPath}($|\/)`);
      if (regex.exec(externalFolderEntity.path)) {
        this.externalFolders.splice(i, 1);
      }
    }
  }

  /*
   * ==================================================
   * Static getters
   * ==================================================
   */
  /**
   * ExternalFoldersCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default ExternalFoldersCollection;
