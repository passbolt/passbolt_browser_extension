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
const {Entity} = require('../abstract/entity');
const {EntitySchema} = require('../abstract/entitySchema');
const {UserEntity} = require("../user/userEntity");
const {SecurityTokenEntity} = require("../securityToken/securityTokenEntity");

const ENTITY_NAME = "Account";

// Type of accounts.
const TYPE_ACCOUNT = "Account";
const TYPE_ACCOUNT_RECOVERY = "Account recovery";

class AccountEntity extends Entity {
  /**
   * Setup entity constructor
   *
   * @param {Object} accountDto account DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(accountDto) {
    // Default properties values
    accountDto = Object.assign(AccountEntity.getDefault(), accountDto);

    super(EntitySchema.validate(
      AccountEntity.ENTITY_NAME,
      accountDto,
      AccountEntity.getSchema()
    ));

    // Associations
    if (this._props.user) {
      this._user = new UserEntity(this._props.user);
      delete this._props.user;
    }
    if (this._props.security_token) {
      this._security_token = new SecurityTokenEntity(this._props.security_token);
      delete this._props.security_token;
    }
  }

  /**
   * Get default properties values
   * @return {object}
   */
  static getDefault() {
    return {
      "type": AccountEntity.TYPE_ACCOUNT,
    };
  }

  /**
   * Get entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "type",
        "domain",
        "user_id",
        "user_public_armored_key",
        "user_private_armored_key",
        "server_public_armored_key",
        "user",
        "security_token",
      ],
      "properties": {
        "type": {
          "type": "string",
          "enum": [
            AccountEntity.TYPE_ACCOUNT,
            AccountEntity.TYPE_ACCOUNT_RECOVERY,
          ]
        },
        "domain": {
          "type": "string"
        },
        "user_id": {
          "type": "string",
          "format": "uuid"
        },
        "token": {
          "type": "string",
          "format": "uuid"
        },
        "user_public_armored_key": {
          "type": "string"
        },
        "user_private_armored_key": {
          "type": "string"
        },
        "server_public_armored_key": {
          "type": "string"
        },
        "locale": {
          "anyOf": [{
            "type": "string",
            "pattern": /^[a-z]{2}-[A-Z]{2}$/,
          }, {
            "type": "null"
          }]
        },
        // Associated models
        "user": UserEntity.getSchema(),
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
   * Return a DTO ready to be sent to API or content code
   * @returns {object}
   */
  toDto() {
    const result = Object.assign({}, this._props);
    if (this._user) {
      result.user = this._user.toDto(UserEntity.ALL_CONTAIN_OPTIONS);
    }
    if (this._security_token) {
      result.security_token = this._security_token.toDto();
    }

    return result;
  }

  /**
   * Return legacy user dto.
   * @returns {{firstname: string, id: string, username: string, lastname: string}}
   */
  toLegacyUserDto() {
    return {
      id: this.userId,
      username: this.user.username,
      firstname: this.user.profile.firstName,
      lastname: this.user.profile.lastName,
      locale: this.user.locale
    };
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
   * Get the account type
   * @return {string}
   */
  get type() {
    return this._props.type;
  }

  /**
   * Get the domain
   * @returns {string} ref ie. http://cloud.passbolt.com/acme
   */
  get domain() {
    return this._props.domain;
  }

  /**
   * Get the user id
   * @returns {string}
   */
  get userId() {
    return this._props.user_id;
  }

  /**
   * Get the user public armored key
   * @returns {string}
   */
  get userPublicArmoredKey() {
    return this._props.user_public_armored_key;
  }

  /**
   * Get the user private armored key
   * @returns {string}
   */
  get userPrivateArmoredKey() {
    return this._props.user_private_armored_key;
  }

  /**
   * Get the server public armored key
   * @returns {string}
   */
  get serverPublicArmoredKey() {
    return this._props.server_public_armored_key;
  }

  /*
   * ==================================================
   * Other associated properties methods
   * ==================================================
   */
  /**
   * Get the user
   * @returns {UserEntity|null}
   */
  get user() {
    return this._user || null;
  }

  /**
   * Get security token
   * @returns {(SecurityTokenEntity|null)}
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
   * AccountEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * AccountEntity.TYPE_ACCOUNT_RECOVERY
   * @returns {string}
   */
  static get TYPE_ACCOUNT_RECOVERY() {
    return TYPE_ACCOUNT_RECOVERY;
  }

  /**
   * AccountEntity.TYPE_ACCOUNT
   * @returns {string}
   */
  static get TYPE_ACCOUNT() {
    return TYPE_ACCOUNT;
  }
}

exports.AccountEntity = AccountEntity;
