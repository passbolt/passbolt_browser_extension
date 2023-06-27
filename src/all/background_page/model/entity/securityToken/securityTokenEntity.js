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

const ENTITY_NAME = "SecurityToken";

class SecurityTokenEntity extends Entity {
  /**
   * Security token entity constructor
   *
   * @param {Object} securityTokenDto security token DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(securityTokenDto) {
    super(EntitySchema.validate(
      SecurityTokenEntity.ENTITY_NAME,
      securityTokenDto,
      SecurityTokenEntity.getSchema()
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
        "code",
        "color",
        "textcolor"
      ],
      "properties": {
        "code": {
          "type": "string",
          "pattern": /^[a-zA-Z0-9-_]{3}$/
        },
        "color": {
          "type": "string",
          "format": "x-hex-color"
        },
        "textcolor": {
          "type": "string",
          "format": "x-hex-color"
        }
      }
    };
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */

  /**
   * Get code
   * @returns {string} ref ie. PB1
   */
  get code() {
    return this._props.code;
  }

  /**
   * Get color
   * @returns {string}
   */
  get color() {
    return this._props.color;
  }

  /**
   * Get text color
   * @returns {string}
   */
  get textcolor() {
    return this._props.textcolor;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */

  /**
   * SecurityTokenEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default SecurityTokenEntity;
