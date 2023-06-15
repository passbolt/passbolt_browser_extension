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
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = "AuthenticationToken";

const AUTHENTICATION_TOKEN_TYPE_LOGIN = 'login';
const AUTHENTICATION_TOKEN_TYPE_MFA = 'mfa';
const AUTHENTICATION_TOKEN_TYPE_MOBILE_TRANSFER = 'mobile_transfer';
const AUTHENTICATION_TOKEN_TYPE_RECOVER = 'recover';
const AUTHENTICATION_TOKEN_TYPE_REGISTER = 'register';

class AuthenticationTokenEntity extends Entity {
  /**
   * Setup entity constructor
   *
   * @param {Object} authenticationTokenDto setup DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(authenticationTokenDto) {
    super(EntitySchema.validate(
      AuthenticationTokenEntity.ENTITY_NAME,
      authenticationTokenDto,
      AuthenticationTokenEntity.getSchema()
    ));
  }

  /**
   * Get entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "token"
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "token": {
          "type": "string",
          "format": "uuid"
        },
        "active": {
          "type": "boolean"
        },
        "type": {
          "type": "string",
          "enum": [
            AuthenticationTokenEntity.AUTHENTICATION_TOKEN_TYPE_LOGIN,
            AuthenticationTokenEntity.AUTHENTICATION_TOKEN_TYPE_MFA,
            AuthenticationTokenEntity.AUTHENTICATION_TOKEN_TYPE_MOBILE_TRANSFER,
            AuthenticationTokenEntity.AUTHENTICATION_TOKEN_TYPE_RECOVER,
            AuthenticationTokenEntity.AUTHENTICATION_TOKEN_TYPE_REGISTER,
          ]
        },
        "created": {
          "type": "string",
          "format": "date-time"
        },
        "modified": {
          "type": "string",
          "format": "date-time"
        },
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
   * Get the token
   * @returns {string}
   */
  get token() {
    return this._props.token;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * AuthenticationTokenEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * AuthenticationTokenEntity.AUTHENTICATION_TOKEN_TYPE_LOGIN
   * @returns {string} login
   */
  static get AUTHENTICATION_TOKEN_TYPE_LOGIN() {
    return AUTHENTICATION_TOKEN_TYPE_LOGIN;
  }

  /**
   * AuthenticationTokenEntity.AUTHENTICATION_TOKEN_TYPE_MFA
   * @returns {string} mfa
   */
  static get AUTHENTICATION_TOKEN_TYPE_MFA() {
    return AUTHENTICATION_TOKEN_TYPE_MFA;
  }

  /**
   * AuthenticationTokenEntity.AUTHENTICATION_TOKEN_TYPE_MOBILE_TRANSFER
   * @returns {string} mobile_transfer
   */
  static get AUTHENTICATION_TOKEN_TYPE_MOBILE_TRANSFER() {
    return AUTHENTICATION_TOKEN_TYPE_MOBILE_TRANSFER;
  }

  /**
   * AuthenticationTokenEntity.AUTHENTICATION_TOKEN_TYPE_RECOVER
   * @returns {string} recover
   */
  static get AUTHENTICATION_TOKEN_TYPE_RECOVER() {
    return AUTHENTICATION_TOKEN_TYPE_RECOVER;
  }

  /**
   * AuthenticationTokenEntity.AUTHENTICATION_TOKEN_TYPE_REGISTER
   * @returns {string} register
   */
  static get AUTHENTICATION_TOKEN_TYPE_REGISTER() {
    return AUTHENTICATION_TOKEN_TYPE_REGISTER;
  }
}

export default AuthenticationTokenEntity;
