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
import ResourceEntity from "./resourceEntity";
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import EntityV2Collection from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2Collection";
import {assertType} from "../../../utils/assertions";

const ENTITY_NAME = 'Resources';
const RULE_UNIQUE_ID = 'unique_id';

class ResourcesCollection extends EntityV2Collection {
  /**
   * @inheritDoc
   */
  get entityClass() {
    return ResourceEntity;
  }

  /**
   * @inheritDoc
   * @throws {EntityCollectionError} Build Rule: Ensure all items in the collection are unique by ID.
   */
  constructor(dtos = [], options = {}) {
    super(dtos, options);
  }

  /*
   * ==================================================
   * Validation
   * ==================================================
   */

  /**
   * Get resources entity schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": ResourceEntity.getSchema(),
    };
  }

  /**
   * @inheritDoc
   * @param {Set} [options.uniqueIdsSetCache] A set of unique ids.
   * @throws {EntityValidationError} If a permission already exists with the same id.
   */
  validateBuildRules(item, options = {}) {
    this.assertNotExist("id", item._props.id, {haystackSet: options?.uniqueIdsSetCache});
  }

  /*
   * ==================================================
   * Dynamic getters
   * ==================================================
   */

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
   * Get first resource position in the collection matching requested id
   * @returns {(int|-1)} index of the first element in the array that matches the id. Otherwise -1.
   */
  getFirstIndexById(resourceId) {
    return this._items.findIndex(r => (r.id === resourceId));
  }

  /*
   * ==================================================
   * Filters
   * ==================================================
   */

  /**
   * Return a new collection with all resources the current user is owner
   *
   * @returns {ResourcesCollection}
   */
  filterByIsOwner() {
    return new ResourcesCollection(this._items.filter(r => r.isOwner()), {validate: false});
  }

  /**
   * Filter by resource types.
   * @param {ResourceTypesCollection} resourceTypes The resource types to filter by
   * @return {void} The function alters the collection itself.
   * @throws TypeError if parameters are invalid
   */
  filterByResourceTypes(resourceTypes) {
    if (!(resourceTypes instanceof ResourceTypesCollection)) {
      throw new TypeError('ResourcesCollection filterByResourceTypes expects resourceTypes to be a ResourceTypesCollection.');
    }

    const resourceTypesIds = resourceTypes.extract("id");
    this.filterByPropertyValueIn("resource_type_id", resourceTypesIds);
  }

  /**
   * Filter by suggested resources.
   * @param {string} url The url to suggest for.
   * @return {void} The function alters the collection itself.
   * @throws TypeError if parameters are invalid
   */
  filterBySuggestResources(url) {
    if (typeof url !== 'string') {
      throw new TypeError('ResourcesCollection filterBySuggestResources expects url to be a string.');
    }

    this.filterByCallback(resource => resource.isSuggestion(url));
  }

  /**
   * Keep the resources if the tag is not present
   *
   * @param {string} tagId
   * @returns {*[]} The resources which they have not the tag
   */
  filterByTagNotPresent(tagId) {
    const tagIsNotPresent = tag => tag.id !== tagId;
    const filterResource = resource => resource.tags.tags.every(tagIsNotPresent);
    return  this._items.filter(filterResource);
  }

  /**
   * Filter out the resources which metadata is encrypted.
   */
  filterOutMetadataEncrypted() {
    this.filterByCallback(resource => resource.isMetadataDecrypted());
  }

  /**
   * Filter out resources having their metadata not encrypted with a user key.
   */
  filterOutMetadataNotEncryptedWithUserKey() {
    this.filterByCallback(resource => resource.isMetadataKeyTypeUserKey());
  }

  /**
   * Update the current collection resource metadata with the given one if the data has not changed.
   *
   * @param {ResourcesCollection} resourcesCollection
   */
  setDecryptedMetadataFromCollection(resourcesCollection) {
    assertType(resourcesCollection, ResourcesCollection, 'The `resourcesCollection` parameter should be a ResourcesCollection.');

    const resourceIdsTable = {};
    resourcesCollection.items.forEach(el => resourceIdsTable[el.id] = el);

    this.items.forEach(encryptedResource => {
      const decryptedResource = resourceIdsTable[encryptedResource.id];
      if (!decryptedResource) {
        // the resource is new and requires a decryption
        return;
      }

      const hasResourceChanged = decryptedResource.modified !== encryptedResource.modified;
      if (hasResourceChanged) {
        // the resource has changed, the decrypted metadata cannot be set without a new decryption
        return;
      }

      // the resource has not changed thus does not requires a new metadata decryption.
      encryptedResource.metadata = decryptedResource.metadata;
    });
  }

  /*
   * ==================================================
   * Setters
   * ==================================================
   */

  /**
   * @inheritDoc
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
    for (const i in resourceIds) {
      this.remove(resourceIds[i]);
    }
  }

  /*
   * ==================================================
   * Association management
   * ==================================================
   */
  /**
   * Remove a tag association for the resource in the collection if present
   *
   * @param {string} tagId uuid
   * @return {boolean} true if removed
   */
  removeTagById(tagId) {
    let removed = false;
    for (const resource of this.resources) {
      if (resource.tags) {
        removed = resource.tags.removeById(tagId) || removed;
      }
    }
    return removed;
  }

  /**
   * Replace tag with a new tag if present in resource collection
   *
   * @param {string} tagId The tag to replace
   * @param {TagEntity} tagEntity The replacement tag
   * @return {boolean} true if updated
   */
  replaceTag(tagId, tagEntity) {
    let updated = false;
    for (const resource of this.resources) {
      if (resource.tags) {
        updated = resource.tags.replaceTag(tagId, tagEntity) || updated;
      }
    }
    return updated;
  }

  /**
   * bulkReplaceTagsCollection
   * For a given list of resource ids update the associated tagsCollection
   * For example resourceIds[0] tags will be replaced with tagsCollections[0]
   *
   * @param {Array<string>} resourceIds
   * @param {Array<TagsCollection>} tagsCollections
   * @returns {int} the number of resources affected
   */
  bulkReplaceTagsCollection(resourceIds, tagsCollections) {
    if (!resourceIds || !Array.isArray(resourceIds) || !resourceIds.length) {
      throw new Error('Resource ids should be provided to bulk update tags in resource collection.');
    }
    if (!tagsCollections || !Array.isArray(tagsCollections) || !tagsCollections.length) {
      throw new Error('Tag collections should be provided to bulk update tags in resource collection.');
    }
    if (resourceIds.length !== tagsCollections.length) {
      throw new Error('Bulk update requires matching tags collections and list of resource ids.');
    }

    let result = 0;
    let i = 0;
    let j;
    for (; i < resourceIds.length; i++) {
      if (i in tagsCollections) {
        const resourceId = resourceIds[i];
        const tagCollection = tagsCollections[i];
        j = this.getFirstIndexById(resourceId);
        if (j >= 0) {
          this.items[j].tags = tagCollection;
          result++;
        } else {
          /*
           * resource not found in collection
           * let the caller decides if it's important based on results
           */
        }
      }
    }

    return result;
  }

  /**
   * Update the current resource collection with the given collection.
   * If an element already exists, it is replaced, otherwise, it's added.
   * Note: mutation of the original collection does not trigger collection validation (schema or build rules).
   * @param {ResourcesCollection} resourcesCollection
   */
  updateWithCollection(resourcesCollection) {
    assertType(resourcesCollection, ResourcesCollection);

    const resourceMapByIdWithIndex = this.items.reduce((result, resource, currentIndex) => {
      result[resource.id] = currentIndex;
      return result;
    }, {});

    for (let i = 0; i < resourcesCollection.length; i++) {
      const resource = resourcesCollection.items[i];
      const mappedResourceIndex = resourceMapByIdWithIndex[resource.id];
      if (typeof mappedResourceIndex === "undefined") {
        this.push(resource, {validate: false});
      } else {
        this._items[mappedResourceIndex] = resource;
      }
    }
  }

  /*
   * ==================================================
   * Static getters
   * ==================================================
   */
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

export default ResourcesCollection;
