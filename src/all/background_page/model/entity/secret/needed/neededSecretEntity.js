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
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'NeededSecret';

class NeededSecretEntity extends Entity {
  /**
   * NeededSecret entity constructor
   * Used to request secret to encrypt
   *
   * @param {Object} neededSecretDto secret DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(neededSecretDto) {
    super(EntitySchema.validate(
      NeededSecretEntity.ENTITY_NAME,
      neededSecretDto,
      NeededSecretEntity.getSchema()
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
        "user_id",
        "resource_id"
      ],
      "properties": {
        "user_id": {
          "type": "string",
          "format": "uuid"
        },
        "resource_id": {
          "type": "string",
          "format": "uuid"
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
   * Get needed secret user id
   * @returns {string} uuid
   */
  get userId() {
    return this._props.user_id;
  }

  /**
   * Get needed secret resource id
   * @returns {string} uuid
   */
  get resourceId() {
    return this._props.resource_id;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */

  /**
   * NeededSecretEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default NeededSecretEntity;
