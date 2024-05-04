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
 * @since         3.0.0
 */
import GroupEntity from "./groupEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityV2Collection from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2Collection";

const ENTITY_NAME = 'Groups';

const RULE_UNIQUE_ID = 'unique_id';
const RULE_UNIQUE_GROUP_NAME = 'unique_group_name';

class GroupsCollection extends EntityV2Collection {
  /**
   * @inheritDoc
   */
  get entityClass() {
    return GroupEntity;
  }

  /**
   * @inheritDoc
   * @param {object} [options.ignoreInvalidEntity=false] Ignore invalid entities.
   * @throws {CollectionValidationError} Build Rule: Ensure all items in the collection are unique by ID.
   * @throws {CollectionValidationError} Build Rule: Ensure all items in the collection are unique by name.
   */
  constructor(groupsCollectionDto, options = {}) {
    super(EntitySchema.validate(
      GroupsCollection.ENTITY_NAME,
      groupsCollectionDto,
      GroupsCollection.getSchema()
    ), options);

    this.pushMany(this._props, {...options, clone: false});

    // We do not keep original props
    this._props = null;
  }

  /*
   * ==================================================
   * Validation
   * ==================================================
   */
  /**
   * Get groups entity schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": GroupEntity.getSchema(),
    };
  }

  /**
   * @inheritDoc
   * @param {Set} [options.uniqueIddSetCache] A set of unique ids.
   * @param {Set} [options.uniqueNamdeSetCache] A set of unique names.
   * @throws {EntityValidationError} If a group already exists with the same id.
   * @throws {EntityValidationError} If a group already exists with the same name.
   */
  validateBuildRules(item, options) {
    this.assertNotExist("id", item._props.id, {haystackSet: options?.uniqueIdsSetCache});
    this.assertNotExist("name", item._props.name, {haystackSet: options?.uniqueNamesSetCache});
  }

  /*
   * ==================================================
   * Setters
   * ==================================================
   */
  /**
   * @inheritDoc
   * This method creates caches of unique ids and names to improve the build rules performance.
   */
  pushMany(data, entityOptions = {}, options = {}) {
    const uniqueIdsSetCache = new Set(this.extract("id"));
    const uniqueNamesSetCache = new Set(this.extract("name"));
    const onItemPushed = item => {
      uniqueIdsSetCache.add(item.id);
      uniqueNamesSetCache.add(item.name);
    };

    options = {
      onItemPushed: onItemPushed,
      validateBuildRules: {...options?.validateBuildRules, uniqueIdsSetCache, uniqueNamesSetCache},
      ...options
    };

    super.pushMany(data, entityOptions, options);
  }

  /*
   * ==================================================
   * Getters
   * ==================================================
   */
  /**
   * Get groups
   * @returns {Array<GroupEntity>}
   */
  get groups() {
    return this._items;
  }

  /**
   * Get all the ids of the groups in the collection
   *
   * @returns {Array<string>}
   */
  get ids() {
    return this._items.map(r => r.id);
  }

  /**
   * Remove a group identified by an Id
   * @param groupId
   */
  remove(groupId) {
    const i = this.items.findIndex(item => item.id === groupId);
    this.items.splice(i, 1);
  }

  /**
   * Remove multiple groups identified by their Ids
   * @param {Array} groupIds
   */
  removeMany(groupIds) {
    for (const i in groupIds) {
      this.remove(groupIds[i]);
    }
  }

  /*
   * ==================================================
   * Static getters
   * ==================================================
   */
  /**
   * GroupsCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * GroupsCollection.RULE_UNIQUE_ID
   * @returns {string}
   */
  static get RULE_UNIQUE_ID() {
    return RULE_UNIQUE_ID;
  }

  /**
   * GroupsCollection.RULE_UNIQUE_GROUP_NAME
   * @returns {string}
   */
  static get RULE_UNIQUE_GROUP_NAME() {
    return RULE_UNIQUE_GROUP_NAME;
  }
}

export default GroupsCollection;
