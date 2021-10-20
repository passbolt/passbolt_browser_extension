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
 */
const {UserEntity} = require("../userEntity");
const {Entity} = require('../abstract/entity');
const {EntitySchema} = require('../abstract/entitySchema');
const {ProfileEntity} = require('../profile/profileEntity');
const {SecurityTokenEntity} = require("../../securityToken/securityTokenEntity");

const ENTITY_NAME = 'UserAccount';

class UserAccountEntity extends Entity {
  /**
   * User entity constructor
   *
   * @param {Object} userAccountDto user DTO
   * @param {Object} [associations] optional {groups_users: <boolean>}
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(userAccountDto, associations) {
    super(EntitySchema.validate(
      UserAccountEntity.ENTITY_NAME,
      UserAccountEntity._cleanupLastLoginDate(userAccountDto),
      UserAccountEntity.getSchema(associations)
    ));

    // Associations
    if (this._props.security_token) {
      this._security_token = new SecurityTokenEntity(this._props.security_token);
      delete this._props.security_token;
    }
  }

  /**
   * Get user entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "username",
      ],
      "properties": {
        "domain": {
          "type": "string",
        },
        "user_id": UserEntity.getSchema().properties.id,
        "username": UserEntity.getSchema().properties.username,
        "first_name": ProfileEntity.getSchema().properties.first_name,
        "last_name": ProfileEntity.getSchema().properties.last_name,
        "armored_key": {
          "type": "string",
        },
        "secret_armored_key": {
          "type": "string",
        },
        "server_armored_key": {
          "type": "string",
        },
        // Associated models
        "security_token": SecurityTokenEntity.getSchema(),
      }
    };
  }

  /*
   * ==================================================
   * Serialization
   * ==================================================
   */
  /**
   * Return a DTO ready to be sent to API
   * @returns {*}
   */
  toDto() {
    const result = Object.assign({}, this._props);

    return result;
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto();
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */
  /**
   * Get user username
   * @returns {string} email
   */
  get username() {
    return this._props.username;
  }

  /*
   * ==================================================
   * Associated properties getters
   * ==================================================
   */
  /**
   * Get security token
   * @returns {SecurityTokenEntity|null}
   */
  get securityToken() {
    return this._security_token || null;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * UserAccountEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

exports.UserAccountEntity = UserAccountEntity;
