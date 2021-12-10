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
const {Entity} = require('../abstract/entity');
const {EntitySchema} = require('../abstract/entitySchema');

const ENTITY_NAME = "AccountRecoveryOrganisationPublicKey";
const FINGERPRINT_MIN_LENGTH = 40;
const FINGERPRINT_MAX_LENGTH = 40;

/**
 * Entity related to the account recovery organisation public key
 */
class AccountRecoveryOrganisationPublicKeyEntity extends Entity {
  /**
   * Setup entity constructor
   *
   * @param {Object} accountRecoveryOrganisationPublicKeyDto account recovery organisation public key DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(accountRecoveryOrganisationPublicKeyDto) {
    super(EntitySchema.validate(
      AccountRecoveryOrganisationPublicKeyEntity.ENTITY_NAME,
      accountRecoveryOrganisationPublicKeyDto,
      AccountRecoveryOrganisationPublicKeyEntity.getSchema()
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
          "type": "string",
          "minLength": FINGERPRINT_MIN_LENGTH,
          "maxLength": FINGERPRINT_MAX_LENGTH
        },
        "created": {
          "type": "string"
        },
        "created_by": {
          "type": "string",
          "format": "uuid"
        },
        "modified": {
          "type": "string"
        },
        "modified_by": {
          "type": "string",
          "format": "uuid"
        },
        "deleted": {
          "type": "string"
        }
      }
    };
  }

  /*
   * ==================================================
   * Serialization
   * ==================================================
   */
  /**
   * Return a DTO ready to be sent to API or content code
   * @returns {object}
   */
  toDto() {
    const result = Object.assign({}, this._props);
    return result;
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
  /**
   * Get permission id
   * @returns {(string|null)} uuid if set
   */
  get id() {
    return this._props.id || null;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * AccountRecoveryOrganisationPublicKeyEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

exports.AccountRecoveryOrganisationPublicKeyEntity = AccountRecoveryOrganisationPublicKeyEntity;
