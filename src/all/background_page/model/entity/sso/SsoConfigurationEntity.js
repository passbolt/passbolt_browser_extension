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

const ENTITY_NAME = "SsoConfiguration";
const AZURE = "azure";

/**
 * Entity related to the account recovery organization policy
 */
class SsoConfigurationEntity extends Entity {
  /**
   * Setup entity constructor
   *
   * @param {Object} accountRecoveryOrganizationPolicyChangeDto account recovery organization policy DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(ssoConfigurationDto) {
    super(EntitySchema.validate(
      SsoConfigurationEntity.ENTITY_NAME,
      ssoConfigurationDto,
      SsoConfigurationEntity.getSchema()
    ));
  }

  /**
   * Get entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": ["provider"],
      "properties": {
        "provider": {
          "type": "string",
          "enum": [
            SsoConfigurationEntity.AZURE,
          ]
        },
        "data": {
          "type": "object",
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
   * SsoConfigurationEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * SsoConfigurationEntity.AZURE
   * @returns {string}
   */
  static get AZURE() {
    return AZURE;
  }
}

export default SsoConfigurationEntity;
