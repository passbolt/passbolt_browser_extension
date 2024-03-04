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
 * @since         3.6.0
 */
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'AccountRecoveryOrganizationPublicKey';
const FINGERPRINT_LENGTH = 40;

class AccountRecoveryOrganizationPublicKeyEntity extends Entity {
  /**
   * @inheritDoc
   * Note: Sanitize the DTO fingerprint by converting it to uppercase.
   */
  constructor(accountRecoveryOrganizationPublicKeyDto, options = {}) {
    accountRecoveryOrganizationPublicKeyDto = AccountRecoveryOrganizationPublicKeyEntity.sanitizeDto(accountRecoveryOrganizationPublicKeyDto);

    super(EntitySchema.validate(
      AccountRecoveryOrganizationPublicKeyEntity.ENTITY_NAME,
      accountRecoveryOrganizationPublicKeyDto,
      AccountRecoveryOrganizationPublicKeyEntity.getSchema()
    ), options);
  }

  /**
   * Get resource entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "armored_key"
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "armored_key": {
          "type": "string",
        },
        "fingerprint": {
          "anyOf": [{
            "type": "string",
            "length": FINGERPRINT_LENGTH
          }, {
            "type": "null"
          }]
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
        "deleted": {
          "type": "string",
          "format": "date-time"
        }
      }
    };
  }

  /*
   * ==================================================
   * Sanitization
   * ==================================================
   */
  /**
   * Sanitize account recovery organization public key dto.
   * @param {object} dto The dto to sanitiaze
   * @returns {object}
   */
  static sanitizeDto(dto) {
    dto = Object.assign({}, dto); // shallow clone.
    if (dto.fingerprint) {
      dto.fingerprint = this.sanitizeFingerPrint(dto.fingerprint);
    }
    return dto;
  }

  /**
   * Sanitize a fingerprint.
   * @param {string} fingerprint The fingerprint to sanitize.
   * @return {string}
   */
  static sanitizeFingerPrint(fingerprint = "") {
    return fingerprint.toUpperCase();
  }

  /*
   * ==================================================
   * Serialization
   * ==================================================
   */
  /**
   * Return a DTO ready to be sent to API
   *
   * @param {object} [contain] optional
   * @returns {object}
   */
  toDto() {
    return Object.assign({}, this._props);
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto();
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */
  get armoredKey() {
    return this._props.armored_key;
  }

  /**
   * Get the public key fingerprint.
   * @returns {string}
   */
  get fingerprint() {
    return this._props.fingerprint;
  }

  /**
   * Set the public key fingerprint.
   * @param {string} fingerprint The fingerprint to set.
   */
  set fingerprint(fingerprint) {
    EntitySchema.validateProp("fingerprint", fingerprint, AccountRecoveryOrganizationPublicKeyEntity.getSchema().properties.fingerprint);
    this._props.fingerprint = AccountRecoveryOrganizationPublicKeyEntity.sanitizeFingerPrint(fingerprint);
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * ResourceEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default AccountRecoveryOrganizationPublicKeyEntity;
