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
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import Validator from "validator";

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
        }
        /*
         * NO ASSOCIATIONS
         * users or groups are omitted
         * to avoid circular dependencies
         */
      }
    };
  }

  /**
   * Return a DTO ready to be sent to API
   * @returns {*}
   */
  toDto() {
    return Object.assign({}, this._props);
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */
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

  /*
   * ==================================================
   * Dynamic properties setters
   * ==================================================
   */

  /**
   * Set the group user id
   *
   * @param {string} id
   * @throws {TypeError} if id is not UUID
   */
  set id(id) {
    if (!Validator.isUUID(id)) {
      throw new TypeError('The group user id should be a valid UUID.');
    }
    this._props.id = id;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * GroupUserEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * GroupUserEntity.ALL_CONTAIN_OPTIONS
   * @returns {object} all contain options that can be used in toDto()
   */
  static get ALL_CONTAIN_OPTIONS() {
    return {};
  }
}

export default GroupUserEntity;
