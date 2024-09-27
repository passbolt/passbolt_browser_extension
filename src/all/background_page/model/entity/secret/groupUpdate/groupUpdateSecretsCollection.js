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
import SecretEntity from "../secretEntity";
import EntityV2Collection from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2Collection";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";

class GroupUpdateSecretsCollection extends EntityV2Collection {
  /**
   * @inheritDoc
   */
  get entityClass() {
    return SecretEntity;
  }

  /**
   * @inheritDoc
   * @throws {EntityCollectionError} Build Rule: Ensure all items in the collection are unique by ID.
   * @throws {EntityCollectionError} Build Rule: Ensure all items in the collection target the same resource and user.
   */
  constructor(dto, options = {}) {
    super(dto, options);
  }

  /**
   * Get GroupUpdate secrets collection schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": SecretEntity.getSchema(),
    };
  }

  /**
   * @inheritdoc
   * @throws {EntityCollectionError} Build Rule: Ensure all items in the collection are unique by ID.
   * @throws {EntityCollectionError} Build Rule: Ensure all items in the collection target the same resource and user.
   */
  validateBuildRules(item, options = {}) {
    this.assertNotExist("id", item._props.id, {haystackSet: options?.uniqueIdsSetCache});
    this.assertUniqueResourceIdUserId(item, {haystackSet: options?.uniqueResourceIdsUserIdsOrNullSetCache});
  }

  /*
   * ==================================================
   * Assertions
   * ==================================================
   */

  /**
   * Assert that the item pushed to the collection is about the same ACO.
   *
   * @param {PermissionEntity} permission The perm
   * @throws {EntityValidationError} if a permission for another ACO already exist
   */
  assertUniqueResourceIdUserId(secret, options) {
    if (!secret.userId || !secret.resourceId) {
      return;
    }

    let haystackSet = options?.haystackSet;

    // If not given initialize the haystack set with the values of the items properties.
    if (!haystackSet) {
      haystackSet = new Set(this.extractUserIdResourceId());
    }

    const resourceIdUserIdKey = GroupUpdateSecretsCollection.getResourceIdUserIdKey(secret);

    if (haystackSet.has(resourceIdUserIdKey)) {
      const error = new EntityValidationError();
      const message = options?.message
        || `The collection already includes an element that has a couple resource_id:user_id (${resourceIdUserIdKey}) with an identical value.`;
      error.addError("resource_id:user_id", 'unique', message);
      throw error;
    }
  }

  /**
   * Extract resource_id and user_id of all the collection items.
   * @returns {array<{resource_id, user_id}>}
   */
  extractUserIdResourceId() {
    return this._items.reduce((accumulator, item) => {
      if (typeof item._props.user_id !== "undefined" && typeof item._props.resource_id !== "undefined") {
        accumulator.push(GroupUpdateSecretsCollection.getResourceIdUserIdKey(item));
      }
      return accumulator;
    }, []);
  }

  /*
   * ==================================================
   * Setters
   * ==================================================
   */
  pushMany(data, entityOptions = {}, options = {}) {
    const uniqueIdsSetCache = new Set(this.extract("id"));

    const uniqueResourceIdsUserIdsOrNullSetCache = new Set(this.extractUserIdResourceId());

    // Build rules
    const onItemPushed = item => {
      uniqueIdsSetCache.add(item.id);
      uniqueResourceIdsUserIdsOrNullSetCache.add(GroupUpdateSecretsCollection.getResourceIdUserIdKey(item));
    };

    options = {
      onItemPushed: onItemPushed,
      validateBuildRules: {...options?.validateBuildRules, uniqueIdsSetCache, uniqueResourceIdsUserIdsOrNullSetCache},
      ...options
    };
    super.pushMany(data, entityOptions, options);
  }

  /**
   * Returns a key used to identify the couple `resource_id:user_id` to assert uniqueness in the collection
   * @param {SecretEntity} secret
   * @returns {string}
   * @private
   */
  static getResourceIdUserIdKey(secret) {
    return `${secret.resourceId}:${secret.userId}`;
  }
}

export default GroupUpdateSecretsCollection;
