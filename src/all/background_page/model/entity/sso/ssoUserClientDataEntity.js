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
 * @since         3.7.3
 */
import Entity from "../abstract/entity";
import EntitySchema from "../abstract/entitySchema";

const ENTITY_NAME = "SsoUserClientDataEntity";

/**
 * Entity related to the SSO user's client data
 */
class SsoUserClientDataEntity extends Entity {
  /**
   * Setup entity constructor
   *
   * @param {Object} ssoUserClientDataDto sso user's client data DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(ssoUserClientDataDto) {
    super(EntitySchema.validate(
      SsoUserClientDataEntity.ENTITY_NAME,
      ssoUserClientDataDto,
      SsoUserClientDataEntity.getSchema()
    ));
  }

  /**
   * Get entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": ["cipher", "key"],
      "properties": {
        "nek": {
          "type": "CryptoKey",
        },
        "iv1": {
          "type": "Uint8Array",
        },
        "iv2": {
          "type": "Uint8Array",
        },
      }
    };
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * SsoUserClientDataEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default SsoUserClientDataEntity;
