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
import EntityCollection from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollection";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'ExternalResources';

class ExternalResourcesCollection extends EntityCollection {
  /**
   * External resources collections constructor
   *
   * @param {array} ExternalResourcesCollectionDto resource DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(ExternalResourcesCollectionDto) {
    super(EntitySchema.validate(
      ExternalResourcesCollection.ENTITY_NAME,
      ExternalResourcesCollectionDto,
      ExternalResourcesCollection.getSchema()
    ));

    /*
     * Note: there is no "multi-item" validation
     * Collection validation will fail at the first item that doesn't validate
     */
    this._props.forEach(externalResourceDto => {
      this.push(new ExternalResourceEntity(externalResourceDto));
    });

    // We do not keep original props
    this._props = null;
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
   * Get external resources
   * @returns {Array<ExternalResourceEntity>}
   */
  get externalResources() {
    return this._items;
  }

  /**
   * Get all the ids of the resources in the collection
   * @returns {Array<string>}
   */
  get ids() {
    return this._items.map(r => r.id);
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
   */
  static constructFromResourcesCollection(resourcesCollection, externalFoldersCollection) {
    if (!(resourcesCollection instanceof ResourcesCollection)) {
      throw new TypeError(`ExternalResourcesCollection constructFromResourcesCollection parameter 1 should be an instance of ResourcesCollection.`);
    }
    if (!(externalFoldersCollection instanceof ExternalFoldersCollection)) {
      throw new TypeError(`ExternalResourcesCollection constructFromResourcesCollection parameter 2 should be an instance of ExternalFoldersCollection.`);
    }
    const externalResourcesDto = resourcesCollection.resources.map(resourceEntity => {
      const externalFolderParent = externalFoldersCollection.getById(resourceEntity.folderParentId);
      const folderParentId = externalFolderParent ? externalFolderParent.id : null;
      const folderParentPath = externalFolderParent ? externalFolderParent.path : "";
      return Object.assign(resourceEntity.toDto({secrets: true}), {folder_parent_id: folderParentId, folder_parent_path: folderParentPath});
    });
    return new ExternalResourcesCollection(externalResourcesDto);
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
    return this.externalResources.filter(externalResource => externalResource.depth === depth);
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
    return this.externalResources.filter(externalResource => externalResource.folderParentId === folderParentId);
  }

  /*
   * ==================================================
   * Setters
   * ==================================================
   */
  /**
   * Push a copy of the external resource to the list
   * @param {object|ExternalResourceEntity} externalResource DTO or ExternalResourceEntity
   */
  push(externalResource) {
    if (!externalResource || typeof externalResource !== 'object') {
      throw new TypeError(`ExternalResourcesCollection push parameter should be an object.`);
    }
    if (externalResource instanceof ExternalResourceEntity) {
      externalResource = externalResource.toDto(); // deep clone
    }
    const externalResourceEntity = new ExternalResourceEntity(externalResource); // validate

    return super.push(externalResourceEntity);
  }

  /**
   * Set the folder parent id of the resources having the given path
   * @param {string} folderParentPath The folder parent path
   * @param {string} folderParentId The corresponding folder parent id
   */
  setFolderParentIdsByPath(folderParentPath, folderParentId) {
    for (const externalResource of this.externalResources) {
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
    this.externalResources.forEach(resource => resource.changeRootPath(rootFolder));
  }

  /**
   * Remove all the resources from the collection that are in the given path
   * @param {string} path the path to remove
   */
  removeByPath(path) {
    for (let i = this.externalResources.length - 1; i >= 0; i--) {
      const externalResourceEntity = this.externalResources[i];
      const escapedPath = path.replace(/[.*+\-?^${}()|[\]\\\/]/g, '\\$&');
      const regex = new RegExp(`^${escapedPath}\/`);
      if (regex.exec(externalResourceEntity.path)) {
        this.externalResources.splice(i, 1);
      }
    }
  }

  /*
   * ==================================================
   * Static getters
   * ==================================================
   */
  /**
   * ExternalResourcesCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default ExternalResourcesCollection;
