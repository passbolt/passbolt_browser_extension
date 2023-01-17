/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.9.0
 */
import Entity from "../abstract/entity";
import EntitySchema from "../abstract/entitySchema";

const ENTITY_NAME = "SsoKitServerPartEntity";

/**
 * Entity related to the account recovery organization policy
 */
class SsoKitServerPartEntity extends Entity {
  /**
   * Setup entity constructor
   *
   * @param {Object} ssoUserServerDataDto sso user's server data DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(ssoUserServerDataDto) {
    super(EntitySchema.validate(
      SsoKitServerPartEntity.ENTITY_NAME,
      ssoUserServerDataDto,
      SsoKitServerPartEntity.getSchema()
    ));
  }

  /**
   * Get entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": ["data"],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "user_id": {
          "type": "string",
          "format": "uuid"
        },
        "data": {
          "type": "string",
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
      }
    };
  }

  /**
   * Returns the id props of the SSO kit.
   * @returns {string}
   */
  get id() {
    return this._props.id;
  }

  /**
   * Returns the data (containing the secret) props.
   * @returns {string}
   */
  get data() {
    return this._props.data;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * SsoKitServerPartEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default SsoKitServerPartEntity;
