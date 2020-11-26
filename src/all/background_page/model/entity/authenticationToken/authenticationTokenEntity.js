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

const ENTITY_NAME = "AuthenticationToken";

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
        "token": {
          "type": "string",
          "format": "uuid"
        }
      }
    }
  }

  // ==================================================
  // Serialization
  // ==================================================
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

  // ==================================================
  // Dynamic properties getters
  // ==================================================
  /**
   * Get the token
   * @returns {string}
   */
  get token() {
    return this._props.token;
  }

  // ==================================================
  // Static properties getters
  // ==================================================
  /**
   * AuthenticationTokenEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

exports.AuthenticationTokenEntity = AuthenticationTokenEntity;