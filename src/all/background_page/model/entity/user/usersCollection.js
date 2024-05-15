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
import UserEntity from "./userEntity";
import EntityV2Collection from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2Collection";

const ENTITY_NAME = 'Users';

class UsersCollection extends EntityV2Collection {
  /**
   * @inheritDoc
   */
  get entityClass() {
    return UserEntity;
  }

  /**
   * @inheritDoc
   * @throws {EntityCollectionError} Build Rule: Ensure all items in the collection are unique by ID.
   * @throws {EntityCollectionError} Build Rule: Ensure all items in the collection are unique by username.
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
   * Get users entity schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": UserEntity.getSchema(),
    };
  }

  /**
   * @inheritDoc
   * @param {Set} [options.uniqueIdsSetCache] A set of unique ids.
   * @param {Set} [options.uniqueUsernamesSetCache] A set of unique names.
   * @throws {EntityValidationError} If a user already exists with the same id.
   * @throws {EntityValidationError} If a user already exists with the same username.
   */
  validateBuildRules(item, options) {
    this.assertNotExist("id", item._props.id, {haystackSet: options?.uniqueIdsSetCache});
    this.assertNotExist("username", item._props.username, {haystackSet: options?.uniqueUsernamesSetCache});
  }

  /*
   * ==================================================
   * Getters
   * ==================================================
   */
  /**
   * Get users
   * @returns {Array<UserEntity>}
   */
  get users() {
    return this._items;
  }

  /**
   * Get all the ids of the users in the collection
   *
   * @returns {Array<string>}
   */
  get ids() {
    return this._items.map(r => r.id);
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
    const uniqueUsernamesSetCache = new Set(this.extract("username"));
    const onItemPushed = item => {
      uniqueIdsSetCache.add(item.id);
      uniqueUsernamesSetCache.add(item.username);
    };

    options = {
      onItemPushed: onItemPushed,
      validateBuildRules: {...options?.validateBuildRules, uniqueIdsSetCache, uniqueUsernamesSetCache},
      ...options
    };

    super.pushMany(data, entityOptions, options);
  }

  /**
   * Remove a user identified by an Id
   * @param userId
   */
  remove(userId) {
    const i = this.items.findIndex(item => item.id === userId);
    this.items.splice(i, 1);
  }

  /**
   * Remove multiple users identified by their Ids
   * @param {Array} userIds
   */
  removeMany(userIds) {
    for (const i in userIds) {
      this.remove(userIds[i]);
    }
  }

  /*
   * ==================================================
   * Static getters
   * ==================================================
   */
  /**
   * UsersCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default UsersCollection;
