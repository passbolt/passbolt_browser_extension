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
 * @since         4.3.0
 */

import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";


const ENTITY_NAME = 'MfaProviderEntity';
const YUBIKEY = "ysbikey";
const TOTP = "totp";
const DUO = "duo";

class MfaProviderEntity extends Entity {
  /**
   * Mfa provider constructor
   *
   * @param {Object} provider mfa provider
   * @throws {EntityValidationError} if the dto cannot be converted into an entity
   */
  constructor(providerDto) {
    super(EntitySchema.validate(
      MfaProviderEntity.ENTITY_NAME,
      providerDto,
      MfaProviderEntity.getSchema()
    ));
  }

  /**
   * Get mfa provider entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "provider",
      ],
      "properties": {
        "provider": {
          "type": "string",
          "enum": [
            YUBIKEY,
            TOTP,
            DUO
          ]
        },
      }
    };
  }
  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */

  /**
   * Get the mfa provider
   * @returns {string}
   */
  get provider() {
    return this._props.provider;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * MfaPolicyEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default MfaProviderEntity;
