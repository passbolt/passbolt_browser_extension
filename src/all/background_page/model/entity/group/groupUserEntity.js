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
const {UserEntity} = require('../user/userEntity');

const ENTITY_NAME = 'GroupUser';

class GroupUserEntity extends Entity {
  /**
   * GroupUser entity constructor
   *
   * @param {Object} groupUserDto groupUser DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(groupUserDto) {
    super(EntitySchema.validate(
      GroupUserEntity.ENTITY_NAME,
      groupUserDto,
      GroupUserEntity.getSchema()
    ));

    // Associations
    if (this._props.user) {
      this._user = new UserEntity(this._props.user);
      delete this._props.user;
    }
  }

  /**
   * Get groupUser entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "user_id",
        "is_admin",
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "user_id": {
          "type": "string",
          "format": "uuid"
        },
        "group_id": {
          "type": "string",
          "format": "uuid"
        },
        "is_admin": {
          "type": "boolean"
        },
        "created": {
          "type": "string",
          "format": "date-time"
        },
        // Relations
        "user": UserEntity.getSchema()
      }
    }
  }

  // ==================================================
  // Dynamic properties getters
  // ==================================================
  /**
   * Get groupUser id
   * @returns {(string|null)} uuid
   */
  get id() {
    return this._props.id || null;
  }

  /**
   * Get groupUser user id
   * @returns {string} uuid
   */
  get userId() {
    return this._props.user_id;
  }

  /**
   * Get groupUser group id
   * @returns {string} uuid
   */
  get groupId() {
    return this._props.group_id || null;
  }

  /**
   * Get group role
   * @returns {boolean} true if admin
   */
  get isAdmin() {
    return this._props.is_admin;
  }

  /**
   * Get created date
   * @returns {(string|null)} date
   */
  get created() {
    return this._props.created || null;
  }

  /**
   * Get associated user
   * @returns {UserEntity|null}
   */
  get user() {
    return this._user || null;
  }

  // ==================================================
  // Static properties getters
  // ==================================================
  /**
   * GroupUserEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

exports.GroupUserEntity = GroupUserEntity;
