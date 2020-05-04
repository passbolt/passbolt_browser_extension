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
const {Entity} = require('../abstract/entity');
const {EntitySchema} = require('../abstract/entitySchema');
const {GroupUserEntity} = require('./groupUserEntity');

const ENTITY_NAME = 'GroupsUsers';

class GroupsUsersCollection extends Entity {
  /**
   * GroupUsers Entity constructor
   *
   * @param {Object} groupsUsersDto folder DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(groupsUsersDto) {
    super(EntitySchema.validate(
      GroupsUsersCollection.ENTITY_NAME,
      groupsUsersDto,
      GroupsUsersCollection.getSchema()
    ));

    // Note: there is no "multi-item" validation
    // Collection validation will fail at the first items that doesn't validate
    this._items = [];
    this._props.forEach(groupUser => {
      this._items.push(new GroupUserEntity(groupUser));
    });

    // We do not keep original props
    this._props = null;
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
    }
  }

  /**
   * Return a DTO ready to be sent to API
   *
   * @returns {*}
   */
  toDto() {
    return JSON.parse(JSON.stringify(this._items));
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this._items;
  }

  // ==================================================
  // Static and dynamic properties getters
  // ==================================================
  /**
   * Get all items references
   * @returns {Array} items
   */
  get items() {
    return this._items;
  }

  /**
   * GroupsUsersCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  // ==================================================
  // Setters
  // ==================================================
  /**
   * Push a copy of the groupUser to the list
   * @param {object} groupUser DTO or GroupUserEntity
   */
  push(groupUser) {
    if (!groupUser || typeof groupUser !== 'object') {
      throw new TypeError(`GroupUsersEntity push parameter should be an object.`);
    }
    if (groupUser instanceof GroupUserEntity) {
      groupUser = groupUser.toDto(); // clone
    }
    groupUser = new GroupUserEntity(groupUser); // validate
    this._items.push(groupUser);
  }
}

exports.GroupsUsersCollection = GroupsUsersCollection;
