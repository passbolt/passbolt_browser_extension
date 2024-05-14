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
import EntityV2Collection from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2Collection";
import GroupUserEntity from "./groupUserEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'GroupsUsers';

class GroupsUsersCollection extends EntityV2Collection {
  /**
   * @inheritDoc
   */
  get entityClass() {
    return GroupUserEntity;
  }

  /**
   * @inheritDoc
   */
  constructor(dtos = [], options = {}) {
    dtos = EntitySchema.validate(
      GroupsUsersCollection.ENTITY_NAME,
      dtos,
      GroupsUsersCollection.getSchema()
    );
    super(dtos, options);
  }

  /**
   * Get GroupsUsers entity schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": GroupUserEntity.getSchema(),
    };
  }

  /*
   * ==================================================
   * Sanitization
   * ==================================================
   */
  /**
   * Sanitize groups users dto:
   * - Remove group user which do not validate
   *
   * @param {array} dto The dto to sanitize.
   * @return {array}
   */
  static sanitizeDto(dto) {
    if (!Array.isArray(dto)) {
      return [];
    }

    const filterValidGroupUser = dto => {
      try {
        new GroupUserEntity(dto);
        return true;
      } catch (error) {
        return false;
      }
    };
    return dto.filter(filterValidGroupUser);
  }

  /*
   * ==================================================
   * Static and dynamic properties getters
   * ==================================================
   */

  /**
   * Get all items references
   * @returns {Array} items
   */
  get groupsUsers() {
    return this._items;
  }

  /**
   * GroupsUsersCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /*
   * ==================================================
   * Finders
   * ==================================================
   */

  /**
   * Get groupUser by user id
   * @param {string} userId The user to look for
   * @return {object}
   */
  getGroupUserByUserId(userId) {
    return this.groupsUsers.find(groupUser => groupUser.userId === userId);
  }

  /**
   * Get groupUser by id
   * @param {string} id The group user id
   * @return {object}
   */
  getById(id) {
    return this.items.find(groupUser => groupUser.id === id);
  }
}

export default GroupsUsersCollection;
