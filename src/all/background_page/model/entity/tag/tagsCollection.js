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
import TagEntity from "./tagEntity";
import EntityCollection from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollection";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityCollectionError from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollectionError";

const ENTITY_NAME = 'Tags';

const RULE_UNIQUE_ID = 'unique_id';
const RULE_UNIQUE_SLUG = 'unique_slug';

class TagsCollection extends EntityCollection {
  /**
   * Tags Entity constructor
   *
   * @param {Object} tagsCollectionDto tag DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(tagsCollectionDto) {
    super(EntitySchema.validate(
      TagsCollection.ENTITY_NAME,
      tagsCollectionDto,
      TagsCollection.getSchema()
    ));

    /*
     * Note: there is no "multi-item" validation
     * Collection validation will fail at the first item that doesn't validate
     */
    this._props.forEach(tag => {
      this.push(new TagEntity(tag));
    });

    // We do not keep original props
    this._props = null;
  }

  /**
   * Get tags entity schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": TagEntity.getSchema(),
    };
  }

  /**
   * Get tags
   * @returns {Array<TagEntity>}
   */
  get tags() {
    return this._items;
  }

  /*
   * ==================================================
   * Assertions
   * ==================================================
   */
  /**
   * Assert there is no other tag with the same id in the collection
   *
   * @param {TagEntity} tag
   * @throws {EntityValidationError} if a tag with the same id already exist
   */
  assertUniqueId(tag) {
    if (!tag.id) {
      return;
    }
    const length = this.tags.length;
    let i = 0;
    for (; i < length; i++) {
      const existingTag = this.tags[i];
      if (existingTag.id && existingTag.id === tag.id) {
        throw new EntityCollectionError(i, TagsCollection.RULE_UNIQUE_ID, `Tag id ${tag.id} already exists.`);
      }
    }
  }

  /**
   * Assert there is no other tag with the same id in the collection
   *
   * @param {TagEntity} tag
   * @throws {EntityValidationError} if a tag with the same id already exist
   */
  assertUniqueSlug(tag) {
    const length = this.tags.length;
    let i = 0;
    for (; i < length; i++) {
      const existingTag = this.tags[i];
      if (existingTag.slug && existingTag.slug === tag.slug) {
        throw new EntityCollectionError(i, TagsCollection.RULE_UNIQUE_SLUG, `Tag slug ${tag.slug} already exists.`);
      }
    }
  }

  /*
   * ==================================================
   * Setters
   * ==================================================
   */
  /**
   * Push a copy of the tag to the list
   * @param {object} tag DTO or TagEntity
   */
  push(tag) {
    if (!tag || typeof tag !== 'object') {
      throw new TypeError(`TagsCollection push parameter should be an object.`);
    }
    if (tag instanceof TagEntity) {
      tag = tag.toDto(); // clone
    }
    const tagEntity = new TagEntity(tag); // validate

    // Build rules
    this.assertUniqueId(tagEntity);
    //this.assertUniqueSlug(tagEntity);

    super.push(tagEntity);
  }

  /**
   * Remove by Id
   * @param {string} tagId uuid
   * @returns {boolean} true if tag was found and removed from the collection
   */
  removeById(tagId) {
    const length = this.tags.length;
    let i = 0;
    for (; i < length; i++) {
      const existingTag = this.tags[i];
      if (existingTag.id === tagId) {
        this._items.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Replace tag
   * @param {string} tagId
   * @param {TagEntity} tagEntity
   * @returns {boolean} true if tag was found and removed from the collection
   */
  replaceTag(tagId, tagEntity) {
    if (!tagId) {
      return false;
    }
    const length = this.tags.length;
    let i = 0;
    for (; i < length; i++) {
      const existingTag = this.tags[i];
      if (existingTag.id === tagId) {
        this._items[i] = tagEntity;
        return true;
      }
    }
    return false;
  }

  /*
   * ==================================================
   * Static getters
   * ==================================================
   */
  /**
   * TagsCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * TagsCollection.RULE_UNIQUE_ID
   * @returns {string}
   */
  static get RULE_UNIQUE_ID() {
    return RULE_UNIQUE_ID;
  }

  /**
   * TagsCollection.RULE_UNIQUE_SLUG
   * @returns {string}
   */
  static get RULE_UNIQUE_SLUG() {
    return RULE_UNIQUE_SLUG;
  }
}

export default TagsCollection;
