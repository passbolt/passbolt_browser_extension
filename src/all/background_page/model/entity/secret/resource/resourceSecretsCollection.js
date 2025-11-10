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
import SecretEntity from "passbolt-styleguide/src/shared/models/entity/secret/secretEntity";
import EntityV2Collection from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2Collection";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";

const ENTITY_NAME = 'ResourceSecrets';

const BUILD_RULE_SAME_RESOURCE = "same_resource";

class ResourceSecretsCollection extends EntityV2Collection {
  /**
   * @inheritDoc
   */
  get entityClass() {
    return SecretEntity;
  }

  /**
   * @inheritDoc
   * @throws {EntityCollectionError} Build Rule: Ensure all items in the collection are unique by ID.
   * @throws {EntityCollectionError} Build Rule: Ensure all items in the collection associated user ID is unique.
   * @throws {EntityCollectionError} Build Rule: Ensure all items in the collection target the same resource.
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
   * @param {Set} [options.uniqueUsersIdsSetCache] A set of unique users ids.
   * @throws {EntityValidationError} If a secret already exists with the same id.
   * @throws {EntityValidationError} If a secret already exists with the same user id.
   * @throws {EntityValidationError} If the secret does not have the same resource id than the other secrets of the collection.
   */
  validateBuildRules(item, options) {
    this.assertNotExist("id", item._props.id, {haystackSet: options?.uniqueIdsSetCache});
    this.assertNotExist("user_id", item._props.user_id, {haystackSet: options?.uniqueUsersIdsSetCache});
    this.assertSameResource(item);
  }

  /**
   * Assert the collection is about the same resource.
   *
   * @param {SecretEntity} secret The secret
   * @throws {EntityValidationError} if a secret for another resource already exist
   * @private
   */
  assertSameResource(secret) {
    if (!this.secrets.length) {
      return;
    }
    if (typeof secret._props.resource_id === "undefined") {
      return;
    }

    const collectionResourceId = this.secrets[0].resourceId;
    if (secret._props.resource_id !== collectionResourceId) {
      const error = new EntityValidationError();
      const message = `The collection is already used for another resource with id ${collectionResourceId}.`;
      error.addError("resource_id", ResourceSecretsCollection.BUILD_RULE_SAME_RESOURCE, message);
      throw error;
    }
  }

  /*
   * ==================================================
   * Getters
   * ==================================================
   */

  /**
   * Get secrets
   * @returns {Array<SecretEntity>}
   */
  get secrets() {
    return this._items;
  }

  /*
   * ==================================================
   * Setters
   * ==================================================
   */
  /**
   * @inheritDoc
   * This method creates caches of unique ids and users ids to improve the build rules performance.
   */
  pushMany(data, entityOptions = {}, options = {}) {
    const uniqueIdsSetCache = new Set(this.extract("id"));
    const uniqueUsersIdsSetCache = new Set(this.extract("user_id"));
    const onItemPushed = item => {
      uniqueIdsSetCache.add(item.id);
      uniqueUsersIdsSetCache.add(item.userId);
    };

    options = {
      onItemPushed: onItemPushed,
      validateBuildRules: {...options?.validateBuildRules, uniqueIdsSetCache, uniqueUsersIdsSetCache},
      ...options
    };

    super.pushMany(data, entityOptions, options);
  }

  /*
   * ==================================================
   * Static getters
   * ==================================================
   */
  /**
   * ResourceSecretsCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
  /**
   * ResourceSecretsCollection.BUILD_RULE_SAME_RESOURCE
   * @returns {string}
   */
  static get BUILD_RULE_SAME_RESOURCE() {
    return BUILD_RULE_SAME_RESOURCE;
  }
}

export default ResourceSecretsCollection;
