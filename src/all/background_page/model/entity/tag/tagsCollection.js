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
   * @inheritDoc
   * @throws {EntityCollectionError} Build Rule: Ensure all items in the collection are unique by ID.
   */
  constructor(tagsCollectionDto, options = {}) {
    super(EntitySchema.validate(
      TagsCollection.ENTITY_NAME,
      tagsCollectionDto,
      TagsCollection.getSchema()
    ), options);

    this.push(this._props, {clone: false});

    // We do not keep original props
    this._props = null;
  }

  /*
   * ==================================================
   * Validation
   * ==================================================
   */
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
   * Validate the collection build rules.
   * @throws {EntityCollectionError} If multiple items have the same id.
   */
  validateBuildRules() {
    this.assertUniqueByProperty("id");
  }

  /*
   * ==================================================
   * Getters
   * ==================================================
   */
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
   * Push an item to the list
   * @param {object|Entity} item The item to push
   * @param {object} [entityOptions] Options for constructing the entity, identical to those accepted by the Entity
   *   constructor that will be utilized for its creation.
   * @private
   */
  _pushItem(item, entityOptions = {}) {
    if (!item || typeof item !== 'object') {
      throw new TypeError(`TagsCollection push parameter should be an object.`);
    }

    if (item instanceof TagEntity) {
      item = item.toDto(TagEntity?.ALL_CONTAIN_OPTIONS); // deep clone
    }

    const entity = new TagEntity(item, entityOptions);
    super.push(entity);
  }

  /**
   * Push one or multiple items to the list.
   * @param {object|Entity|array} data The item(s) to add to the collection should be in the form of a DTO, an entity,
   *   or an array comprising any of the aforementioned.
   * @param {object} [entityOptions] Options for constructing the entity, identical to those accepted by the Entity
   *   constructor that will be utilized for its creation.
   * @throws {EntityCollectionError} If one build rule does not validate.
   * @throws {EntityValidationError} If one entity schema rule doesn't validate
   *   (@todo could be an EntityCollectionError to keep a trace of the position of the failing item.)
   */
  push(data, entityOptions = {}) {
    if (Array.isArray(data)) {
      data.forEach(itemDto => {
        this._pushItem(itemDto, entityOptions);
      });
    } else {
      this._pushItem(data, entityOptions);
    }

    this.validateBuildRules();
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
