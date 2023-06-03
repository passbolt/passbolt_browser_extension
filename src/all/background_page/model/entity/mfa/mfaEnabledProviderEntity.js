
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
 * @since         3.11.0
 */

import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";


const ENTITY_NAME = 'MfaEnabledProvider';

class MfaEnabledProviderEntity extends Entity {
  /**
   * Mfa entity constructor
   *
   * @param {Object} MfaDto mfa dto
   * @throws {EntityValidationError} if the dto cannot be converted into an entity
   */
  constructor(MfaDto) {
    super(EntitySchema.validate(
      MfaEnabledProviderEntity.ENTITY_NAME,
      MfaDto,
      MfaEnabledProviderEntity.getSchema()
    ));
  }

  /**
   * Get mfa policy entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "totp",
        "duo",
        "yubikey"
      ],
      "properties": {
        "yubikey": {
          "type": "boolean",
        },
        "totp": {
          "type": "boolean",
        },
        "duo": {
          "type": "boolean",
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
   * get the yubikey prop
   * @returns {boolean}
   */
  get yubikey() {
    return this._props.yubikey;
  }


  /**
   * get the totp prop
   * @returns {boolean}
   */
  get totp() {
    return this._props.totp;
  }


  /**
   * get the duo prop
   * @returns {boolean}
   */
  get duo() {
    return this._props.duo;
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

export default MfaEnabledProviderEntity;
