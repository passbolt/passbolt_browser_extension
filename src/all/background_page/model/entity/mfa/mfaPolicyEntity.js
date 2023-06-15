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


const ENTITY_NAME = 'Mfa-Policy';

class MfaPolicyEntity extends Entity {
  /**
   * Mfa policy entity constructor
   *
   * @param {Object} mfaPolicyDto mfa policy dto
   * @throws {EntityValidationError} if the dto cannot be converted into an entity
   */
  constructor(mfaPolicyDto) {
    super(EntitySchema.validate(
      MfaPolicyEntity.ENTITY_NAME,
      mfaPolicyDto,
      MfaPolicyEntity.getSchema()
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
        "policy",
        "remember_me_for_a_month"
      ],
      "properties": {
        "policy": {
          "type": "string",
          enum: MfaPolicyEntity.SUPPORTED_POLICY_TYPE
        },
        "remember_me_for_a_month": {
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
   * Get the policy setting
   * @returns {string}
   */
  get policy() {
    return this._props.policy;
  }

  /**
   * Get the remember me for a month setting
   * @returns {boolean}
   */
  get rememberMeForAMonth() {
    return this._props.remember_me_for_a_month;
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

  /**
   * MfaPolicyEntity.SUPPORTED_POLICY_TYPE
   * @returns {array<string>}
   */
  static get SUPPORTED_POLICY_TYPE() {
    return [
      MfaPolicyEntity.OPTIN,
      MfaPolicyEntity.MANDATORY
    ];
  }


  /**
   * MfaPolicyEntity.OptIn
   * @returns {string}
   */
  static get OPTIN() {
    return "opt-in";
  }

  /**
   * MfaPolicyEntity.Mandatory
   * @returns {string}
   */
  static get MANDATORY() {
    return "mandatory";
  }
}

export default MfaPolicyEntity;
