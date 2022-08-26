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

const ENTITY_NAME = "SsoUserServerDataEntity";

/**
 * Entity related to the account recovery organization policy
 */
class SsoUserServerDataEntity extends Entity {
  /**
   * Setup entity constructor
   *
   * @param {Object} ssoUserServerDataDto sso user's server data DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(ssoUserServerDataDto) {
    super(EntitySchema.validate(
      SsoUserServerDataEntity.ENTITY_NAME,
      ssoUserServerDataDto,
      SsoUserServerDataEntity.getSchema()
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
        "cipher": {
          "type": "string",
        },
        "key": {
          "type": "object",
        },
      }
    };
  }

  /**
   * Returns the cipher props.
   * @returns {string}
   */
  get cipher() {
    return this._props.cipher;
  }

  /**
   * Returns the key props.
   * @returns {object}
   */
  get key() {
    return this._props.key;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * SsoUserServerDataEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default SsoUserServerDataEntity;
