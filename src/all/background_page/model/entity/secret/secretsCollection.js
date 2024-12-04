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
 * @since         4.10.1
 */
import SecretEntity from "./secretEntity";
import EntityV2Collection from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2Collection";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";

class SecretsCollection extends EntityV2Collection {
  /**
   * @inheritDoc
   */
  get entityClass() {
    return SecretEntity;
  }

  /**
   * @inheritDoc
   * @throws {EntityCollectionError} Build Rule: Ensure all items in the collection tuple user_id and resource_id is unique.
   */
  constructor(dtos = [], options = {}) {
    super(dtos, options);
  }

  /**
   * Get collection schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": SecretEntity.getSchema(),
    };
  }

  /*
   * ==================================================
   * Validation
   * ==================================================
   */

  /**
   * @inheritDoc
   * @param {Set} [options.uniqueIdsSetCache] A set of unique ids.
   * @param {Set} [options.uniqueResourceIdUserIdSetCache] A set of unique tuple resource id - user id.
   * @throws {EntityValidationError} If a secret already exists with the same id
   * @throws {EntityValidationError} If a secret already exists with the same resource id and user id.
   */
  validateBuildRules(item, options) {
    this.assertNotExist("id", item._props.id, {haystackSet: options?.uniqueIdsSetCache});
    this.assertUniqueResourceIdUserId(item, {haystackSet: options?.uniqueResourceIdUserIdSetCache});
  }

  /**
   * Assert that the item pushed to the collection is about the same ACO.
   *
   * @param {SecretEntity} secret The secret to assert.
   * @param {object} options.
   * @param {Set} [options.haystackSet] A set of unique resource_id and user_ids tuples.
   * @throws {EntityValidationError} if a secret already exists with the same resource id and user id.
   */
  assertUniqueResourceIdUserId(secret, options) {
    if (!secret.userId || !secret.resourceId) {
      return;
    }

    let haystackSet = options?.haystackSet;

    // If not given initialize the haystack set with the values of the items properties.
    if (!haystackSet) {
      haystackSet = new Set(this.items.map(item => `${item.resourceId}:${item.userId}`));
    }

    const resourceIdUserIdKey = `${secret.resourceId}:${secret.userId}`;

    if (haystackSet.has(resourceIdUserIdKey)) {
      const error = new EntityValidationError();
      const message = `The collection already includes an element that has a couple resource_id:user_id (${resourceIdUserIdKey}) with an identical value.`;
      error.addError("resource_id:user_id", 'unique', message);
      throw error;
    }
  }

  /*
   * ==================================================
   * Setters
   * ==================================================
   */
  /**
   * @inheritDoc
   * This method creates a cache of unique resource_id and users id tuple to improve the build rules performance.
   */
  pushMany(data, entityOptions = {}, options = {}) {
    const uniqueIdsSetCache = new Set(this.extract("id"));
    const uniqueResourceIdUserIdSetCache = new Set(this.items.map(item => `${item.id}:${item.userId}`));
    const onItemPushed = item => {
      uniqueIdsSetCache.add(item.id);
      uniqueResourceIdUserIdSetCache.add(`${item.resourceId}:${item.userId}`);
    };

    options = {
      onItemPushed: onItemPushed,
      validateBuildRules: {...options?.validateBuildRules, uniqueIdsSetCache, uniqueResourceIdUserIdSetCache},
      ...options
    };

    super.pushMany(data, entityOptions, options);
  }
}

export default SecretsCollection;
