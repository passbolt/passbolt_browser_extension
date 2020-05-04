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
const {EntitySchema} = require('../abstract/entitySchema');
const {FolderEntity} = require('./folderEntity');

const ENTITY_NAME = 'Folders';

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
    // Collection validation will fail at the first items that doesn't validate
    this._items = [];
    this._props.forEach(folder => {
      this._items.push(new FolderEntity(folder));
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
  // Static getter
  // ==================================================
  /**
   * FoldersCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
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
      folder = folder.toDto(); // clone
    }
    folder = new FolderEntity(folder); // validate
    super.push(folder);
  }
}

exports.FoldersCollection = FoldersCollection;
