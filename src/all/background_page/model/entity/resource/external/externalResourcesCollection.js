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
import ResourcesCollection from "../resourcesCollection";
import ExternalFoldersCollection from "../../folder/external/externalFoldersCollection";
import ExternalResourceEntity from "./externalResourceEntity";
import EntityV2Collection from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2Collection";
import {assertType} from "../../../../utils/assertions";

class ExternalResourcesCollection extends EntityV2Collection {
  /**
   * @inheritDoc
   */
  get entityClass() {
    return ExternalResourceEntity;
  }

  /**
   * @inheritDoc
   * @throws {EntityCollectionError} Build Rule: Ensure all items with an ID in the collection has a unique ID.
   */
  constructor(dtos = [], options = {}) {
    super(dtos, options);
  }

  /**
   * Get resources entity schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": ExternalResourceEntity.getSchema(),
    };
  }

  /**
   * @inheritdoc
   */
  validateBuildRules(item, options = {}) {
    this.assertNotExist("id", item._props.id, options);
  }

  /**
   * Construct from a resources collection.
   * Optionally a folders collection can be given to organize the resources as per a context
   * i.e. A resource which has a parent folder present in the collection will have its path relative to this folder.
   * i.e. A resource which has a parent not present in the collection will be considered at the root of the collection
   * @param {ResourcesCollection} resourcesCollection The collection of resource
   * @param {ExternalFoldersCollection} externalFoldersCollection The collection of folders to organize the resources.
   * If none given, the resources will be considered at the root of the collection
   * @return {ExternalResourcesCollection}
   * @throws {TypeError} if resourcesCollection argument is not a ResourcesCollection
   * @throws {TypeError} if externalFoldersCollection argument is not a ExternalFoldersCollection
   */
  static constructFromResourcesCollection(resourcesCollection, externalFoldersCollection) {
    assertType(resourcesCollection, ResourcesCollection);
    assertType(externalFoldersCollection, ExternalFoldersCollection);

    const externalResourcesDto = resourcesCollection.resources.map(resourceEntity => {
      const externalFolderParent = externalFoldersCollection.getById(resourceEntity.folderParentId);
      const resourceDto = resourceEntity.toDto({secrets: true, metadata: true});
      return ExternalResourceEntity.buildDtoFromResourceEntityDto(resourceDto, externalFolderParent);
    });
    return new ExternalResourcesCollection(externalResourcesDto);
  }

  /*
   * ==================================================
   * Serialization
   * ==================================================
   */
  /**
   * Return a DTO ready to be sent to the API
   *
   * @returns {Array<ResourceEntityDto>}
   */
  toResourceCollectionImportDto() {
    return this._items.map(item => item.toResourceEntityImportDto());
  }

  /*
   * ==================================================
   * Finders / Filters
   * ==================================================
   */

  /**
   * Get external resources by depth
   * @param {int} depth The depth
   * @return {array}
   */
  getByDepth(depth) {
    return this._items.filter(externalResource => externalResource.depth === depth);
  }

  /**
   * Get external resources by folder parent id
   * @param {string} folderParentId The folder parent id
   * @return {array<ExternalResourceEntity>}
   */
  getByFolderParentId(folderParentId) {
    if (!folderParentId) {
      return [];
    }
    return this._items.filter(externalResource => externalResource.folderParentId === folderParentId);
  }

  /*
   * ==================================================
   * Setters
   * ==================================================
   */
  pushMany(data, entityOptions = {}, options = {}) {
    const uniqueIdsOrNullSetCache = new Set(this.extract("id"));

    // Build rules
    const onItemPushed = item => {
      uniqueIdsOrNullSetCache.add(item.id);
    };

    options = {
      onItemPushed: onItemPushed,
      validateBuildRules: {...options?.validateBuildRules, uniqueIdsOrNullSetCache},
      ...options
    };
    super.pushMany(data, entityOptions, options);
  }

  /**
   * Set the folder parent id of the resources having the given path
   * @param {string} folderParentPath The folder parent path
   * @param {string} folderParentId The corresponding folder parent id
   */
  setFolderParentIdsByPath(folderParentPath, folderParentId) {
    for (const externalResource of this._items) {
      if (externalResource.folderParentPath === folderParentPath) {
        externalResource.folderParentId = folderParentId;
      }
    }
  }

  /**
   * Move resources at a new root path
   * @param {ExternalFolderEntity} rootFolder The folder to use as root
   */
  changeRootPath(rootFolder) {
    this._items.forEach(resource => resource.changeRootPath(rootFolder));
  }

  /**
   * Remove all the resources from the collection that are in the given path
   * @param {string} path the path to remove
   */
  removeByPath(path) {
    for (let i = this._items.length - 1; i >= 0; i--) {
      const externalResourceEntity = this._items[i];
      const escapedPath = path.replace(/[.*+\-?^${}()|[\]\\\/]/g, '\\$&');
      const regex = new RegExp(`^${escapedPath}\/`);
      if (regex.exec(externalResourceEntity.path)) {
        this._items.splice(i, 1);
      }
    }
  }
}

export default ExternalResourcesCollection;
