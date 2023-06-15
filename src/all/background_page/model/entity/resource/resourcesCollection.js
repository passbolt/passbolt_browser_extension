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
import EntityCollection from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollection";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityCollectionError from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollectionError";
import deduplicateObjects from "../../../utils/array/deduplicateObjects";
import canSuggestUrl from "../../../utils/url/canSuggestUrl";

const ENTITY_NAME = 'Resources';
const RULE_UNIQUE_ID = 'unique_id';
const SUGGESTED_RESOURCES_LIMIT = 6;

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

    /*
     * Check if resource ids are unique
     * Why not this.push? It is faster than adding items one by one
     */
    const ids = this._props.map(resource => resource.id);
    ids.sort().sort((a, b) => {
      if (a === b) {
        throw new EntityCollectionError(0, ResourcesCollection.RULE_UNIQUE_ID, `Resource id ${a} already exists.`);
      }
    });
    // Directly push into the private property _items[]
    this._props.forEach(resource => {
      this._items.push(new ResourceEntity(resource));
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
    };
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
   * Get first resource position in the collection matching requested id
   * @returns {(int|-1)} index of the first element in the array that matches the id. Otherwise -1.
   */
  getFirstIndexById(resourceId) {
    return this._items.findIndex(r => (r.id === resourceId));
  }

  /**
   * Return a new collection with all resources the current user is owner
   *
   * @returns {ResourcesCollection}
   */
  getAllWhereOwner() {
    return new ResourcesCollection(this._items.filter(r => r.isOwner()));
  }

  /**
   * Find the possible resources to suggest given an url
   * @param url An url
   * @return {*[]} A list of resource
   */
  findSuggestedResources(url) {
    const suggestedResources = [];
    for (let index = 0; index < this._items.length; index++) {
      if (this._items[index].uri) {
        const canBeSuggested = canSuggestUrl(url, this._items[index].uri);
        if (canBeSuggested) {
          suggestedResources.push(this._items[index]);
        }
        if (suggestedResources.length === SUGGESTED_RESOURCES_LIMIT) {
          break;
        }
      }
    }
    return suggestedResources;
  }

  /**
   * Returns the count of possible resources to suggest given an url
   * @param currentUrl An url
   * @return {*[]|number}
   */
  countSuggestedResources(url) {
    let count = 0;
    for (let index = 0; index < this._items.length; index++) {
      if (this._items[index].uri) {
        const canBeSuggested = canSuggestUrl(url, this._items[index].uri);
        count = canBeSuggested ? count + 1 : count;
        if (count === SUGGESTED_RESOURCES_LIMIT) {
          break;
        }
      }
    }
    return count;
  }

  /*
   * ==================================================
   * Sanitization
   * ==================================================
   */

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

  /*
   * ==================================================
   * Sanitization
   * ==================================================
   */
  /**
   * Sanitize resources dto:
   * - Deduplicate the resources by id.
   *
   * @param {Array} dto The resources dto
   * @returns {Array}
   */
  static sanitizeDto(dto) {
    if (!Array.isArray(dto)) {
      return [];
    }

    return deduplicateObjects(dto, 'id');
  }

  /*
   * ==================================================
   * Assertions
   * ==================================================
   */
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
    for (; i < length; i++) {
      const existingResource = this.resources[i];
      if (existingResource.id && existingResource.id === resource.id) {
        throw new EntityCollectionError(i, ResourcesCollection.RULE_UNIQUE_ID, `Resource id ${resource.id} already exists.`);
      }
    }
  }

  /*
   * ==================================================
   * Setters
   * ==================================================
   */
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
