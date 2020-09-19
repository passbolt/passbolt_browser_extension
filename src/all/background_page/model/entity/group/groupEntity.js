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
const {GroupsUsersCollection} = require('./groupsUsersCollection');

const ENTITY_NAME = 'Group';
const GROUP_NAME_MIN_LENGTH = 1;
const GROUP_NAME_MAX_LENGTH = 255;

class GroupEntity extends Entity {
  /**
   * Group entity constructor
   *
   * @param {Object} groupDto group DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(groupDto) {
    super(EntitySchema.validate(
      GroupEntity.ENTITY_NAME,
      groupDto,
      GroupEntity.getSchema()
    ));
  }

  /**
   * Get group entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "name"
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "name": {
          "type": "string",
          "minLength": GROUP_NAME_MIN_LENGTH,
          "maxLength": GROUP_NAME_MAX_LENGTH
        },
        "deleted": {
          "type": "boolean"
        },
        "created": {
          "type": "string",
          "format": "date-time"
        },
        "modified": {
          "type": "string",
          "format": "date-time"
        },
        "created_by": {
          "type": "string",
          "format": "uuid"
        },
        "modified_by": {
          "type": "string",
          "format": "uuid"
        },
        // Associations
        "groups_users": GroupsUsersCollection.getSchema()
      }
    }
  }

  // ==================================================
  // Dynamic properties getters
  // ==================================================
  /**
   * Get group id
   * @returns {(string|null)} uuid
   */
  get id() {
    return this._props.id || null;
  }

  /**
   * Get group name
   * @returns {string} admin or user
   */
  get name() {
    return this._props.name;
  }

  /**
   * Get deleted flag info
   * @returns {(boolean|null)} true if deleted
   */
  get isDeleted() {
    return this._props.deleted || null;
  }

  /**
   * Get created date
   * @returns {(string|null)} date
   */
  get created() {
    return this._props.created || null;
  }

  /**
   * Get modified date
   * @returns {(string|null)} date
   */
  get modified() {
    return this._props.modified || null;
  }

  /**
   * Get created by user id
   * @returns {(string|null)} uuid
   */
  get createdBy() {
    return this._props.created_by || null;
  }

  /**
   * Get modified by user id
   * @returns {(string|null)} date
   */
  get modifiedBy() {
    return this._props.modified_by || null;
  }

  // ==================================================
  // Static properties getters
  // ==================================================
  /**
   * GroupEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

exports.GroupEntity = GroupEntity;
