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
const {ResourceTypeEntity} = require('./resourceTypeEntity');

const ENTITY_NAME = 'ResourceTypes';
const RULE_UNIQUE_ID = 'unique_id';

class ResourceTypesCollection extends EntityCollection {
  /**
   * Resource Types Entity constructor
   *
   * @param {Object} resourceTypesCollectionDto resourceType DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(resourceTypesCollectionDto) {
    super(EntitySchema.validate(
      ResourceTypesCollection.ENTITY_NAME,
      resourceTypesCollectionDto,
      ResourceTypesCollection.getSchema()
    ));

    // Note: there is no "multi-item" validation
    // Collection validation will fail at the first item that doesn't validate
    this._props.forEach(resourceType => {
      this.push(new ResourceTypeEntity(resourceType));
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
      "items": ResourceTypeEntity.getSchema(),
    }
  }

  /**
   * Get resourceType types
   * @returns {Array<ResourceTypeEntity>}
   */
  get resourceTypes() {
    return this._items;
  }

  /**
   * Get all the ids of the resources in the collection
   *
   * @returns {Array<ResourceTypeEntity>}
   */
  get ids() {
    return this._items.map(r => r.id);
  }

  // ==================================================
  // Assertions
  // ==================================================
  /**
   * Assert there is no other resourceType with the same id in the collection
   *
   * @param {ResourceTypeEntity} resourceType entity
   * @throws {EntityValidationError} if a resourceType with the same id already exist
   */
  assertUniqueId(resourceType) {
    if (!resourceType.id) {
      return;
    }
    const length = this.resourceTypes.length;
    let i = 0;
    for(; i < length; i++) {
      let existingResourceType = this.resourceTypes[i];
      if (existingResourceType.id && existingResourceType.id === resourceType.id) {
        throw new EntityCollectionError(i, ResourceTypesCollection.RULE_UNIQUE_ID, `Resource type id ${resourceType.id} already exists.`);
      }
    }
  }

  // ==================================================
  // Setters
  // ==================================================
  /**
   * Push a copy of the resourceType to the list
   * @param {object} resourceType DTO or ResourceTypeEntity
   */
  push(resourceType) {
    if (!resourceType || typeof resourceType !== 'object') {
      throw new TypeError(`ResourceTypesCollection push parameter should be an object.`);
    }
    if (resourceType instanceof ResourceTypeEntity) {
      resourceType = resourceType.toDto(); // deep clone
    }
    const resourceTypeEntity = new ResourceTypeEntity(resourceType); // validate

    // Build rules
    this.assertUniqueId(resourceTypeEntity);

    super.push(resourceTypeEntity);
  }

  // ==================================================
  // Static getters
  // ==================================================
  /**
   * ResourceTypesCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * ResourceTypesCollection.RULE_UNIQUE_ID
   * @returns {string}
   */
  static get RULE_UNIQUE_ID() {
    return RULE_UNIQUE_ID;
  }
}

exports.ResourceTypesCollection = ResourceTypesCollection;
