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
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityV2Collection from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2Collection";

const ENTITY_NAME = 'Tags';

const RULE_UNIQUE_ID = 'unique_id';
const RULE_UNIQUE_SLUG = 'unique_slug';

class TagsCollection extends EntityV2Collection {
  /**
   * @inheritDoc
   */
  get entityClass() {
    return TagEntity;
  }

  /**
   * @inheritDoc
   * @throws {EntityCollectionError} Build Rule: Ensure all items in the collection are unique by ID.
   */
  constructor(dtos = [], options = {}) {
    dtos = EntitySchema.validate(
      TagsCollection.ENTITY_NAME,
      dtos,
      TagsCollection.getSchema()
    );
    super(dtos, options);
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
   * @inheritDoc
   * @param {Set} [options.uniqueIdsSetCache] A set of unique ids.
   * @throws {EntityValidationError} If a tag already exists with the same id.
   */
  validateBuildRules(item, options) {
    this.assertNotExist("id", item._props.id, {haystackSet: options?.uniqueIdsSetCache});
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
   * Setters
   * ==================================================
   */
  /**
   * @inheritDoc
   * This method creates caches of unique ids to improve the build rules performance.
   */
  pushMany(data, entityOptions = {}, options = {}) {
    const uniqueIdsSetCache = new Set(this.extract("id"));
    const onItemPushed = item => {
      uniqueIdsSetCache.add(item.id);
    };

    options = {
      onItemPushed: onItemPushed,
      validateBuildRules: {...options?.validateBuildRules, uniqueIdsSetCache
      },
      ...options
    };

    super.pushMany(data, entityOptions, options);
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
