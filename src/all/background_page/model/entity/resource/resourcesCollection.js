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
const {EntityCollectionError} = require('../abstract/entityCollectionError');
const {ResourceEntity} = require('./resourceEntity');

const ENTITY_NAME = 'Resources';

const RULE_UNIQUE_ID = 'unique_id';

class ResourcesCollection extends EntityCollection {
  /**
   * Resources Entity constructor
   *
   * @param {Object} resourcesCollectionDto resource DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(resourcesCollectionDto) {
    super(EntitySchema.validate(
      ResourcesCollection.ENTITY_NAME,
      resourcesCollectionDto,
      ResourcesCollection.getSchema()
    ));

    // Note: there is no "multi-item" validation
    // Collection validation will fail at the first item that doesn't validate
    this._props.forEach(resource => {
      this.push(new ResourceEntity(resource));
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
      "items": ResourceEntity.getSchema(),
    }
  }

  /**
   * Get resources
   * @returns {Array<ResourceEntity>}
   */
  get resources() {
    return this._items;
  }

  /**
   * Get all the ids of the resources in the collection
   *
   * @returns {Array<string>}
   */
  get ids() {
    return this._items.map(r => r.id);
  }

  /**
   * Get all the folder parent ids for the resources in the collection
   * Exclude 'null' aka when parent is the root
   *
   * @returns {Array<string>}
   */
  get folderParentIds() {
    return this._items
      .filter(r => (r.folderParentId !== null))
      .map(r => r.folderParentId);
  }

  /**
   * Get first resource in the collection matching requested id
   * @returns {(ResourceEntity|undefined)}
   */
  getFirstById(resourceId) {
    return this._items.find(r => (r.id === resourceId));
  }

  /**
   * Return a new collection with all resources the current user is owner
   *
   * @returns {ResourcesCollection}
   */
  getAllWhereOwner() {
    return new ResourcesCollection(this._items.filter(r => r.isOwner()));
  }

  // ==================================================
  // Assertions
  // ==================================================
  /**
   * Assert there is no other resource with the same id in the collection
   *
   * @param {ResourceEntity} resource
   * @throws {EntityValidationError} if a resource with the same id already exist
   */
  assertUniqueId(resource) {
    if (!resource.id) {
      return;
    }
    const length = this.resources.length;
    let i = 0;
    for(; i < length; i++) {
      let existingResource = this.resources[i];
      if (existingResource.id && existingResource.id === resource.id) {
        throw new EntityCollectionError(i, ResourcesCollection.RULE_UNIQUE_ID, `Resource id ${resource.id} already exists.`);
      }
    }
  }

  // ==================================================
  // Setters
  // ==================================================
  /**
   * Push a copy of the resource to the list
   * @param {object} resource DTO or ResourceEntity
   */
  push(resource) {
    if (!resource || typeof resource !== 'object') {
      throw new TypeError(`ResourcesCollection push parameter should be an object.`);
    }
    if (resource instanceof ResourceEntity) {
      resource = resource.toDto(ResourceEntity.ALL_CONTAIN_OPTIONS); // deep clone
    }
    const resourceEntity = new ResourceEntity(resource); // validate

    // Build rules
    this.assertUniqueId(resourceEntity);

    super.push(resourceEntity);
  }

  /**
   * Remove a resource identified by an Id
   * @param resourceId
   */
  remove(resourceId) {
    const i = this.items.findIndex(item => item.id === resourceId);
    this.items.splice(i, 1);
  }

  /**
   * Remove multiple resources identified by their Ids
   * @param {Array} resourceIds
   */
  removeMany(resourceIds) {
    for(let i in resourceIds) {
      this.remove(resourceIds[i]);
    }
  }

  // ==================================================
  // Static getters
  // ==================================================
  /**
   * ResourcesCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * ResourcesCollection.RULE_UNIQUE_ID
   * @returns {string}
   */
  static get RULE_UNIQUE_ID() {
    return RULE_UNIQUE_ID;
  }
}

exports.ResourcesCollection = ResourcesCollection;
