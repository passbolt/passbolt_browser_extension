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

const ENTITY_NAME = "AccountRecoveryPrivateKeyPassword";
const FOREIGN_MODEL_ORGANIZATION_KEY = "AccountRecoveryOrganizationKey";
const FINGERPRINT_LENGTH = 40;
/**
 * Entity related to the account recovery private key password
 */
class AccountRecoveryPrivateKeyPasswordEntity extends Entity {
  /**
   * Setup entity constructor
   *
   * @param {Object} accountRecoveryPrivateKeyPasswordDto account recovery organization public key DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(accountRecoveryPrivateKeyPasswordDto) {
    super(EntitySchema.validate(
      AccountRecoveryPrivateKeyPasswordEntity.ENTITY_NAME,
      accountRecoveryPrivateKeyPasswordDto,
      AccountRecoveryPrivateKeyPasswordEntity.getSchema()
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
        "recipient_foreign_model",
        "recipient_fingerprint",
        "data"
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "private_key_id": {
          "type": "string",
          "format": "uuid"
        },
        "recipient_foreign_model": {
          "type": "string",
          "enum": [AccountRecoveryPrivateKeyPasswordEntity.FOREIGN_MODEL_ORGANIZATION_KEY]
        },
        "recipient_foreign_key": {
          "type": "string",
          "format": "uuid"
        },
        "recipient_fingerprint": {
          "type": "string",
          "length": FINGERPRINT_LENGTH
        },
        "data": {
          "type": "string"
        },
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

  /**
   * Get id
   * @returns {(string|null)} uuid if set
   */
  get id() {
    return this._props.id || null;
  }

  /**
   * Get the private key id
   * @returns {(string|null)} uuid if set
   */
  get privateKeyId() {
    return this._props.private_key_id || null;
  }

  /**
   * Get recipient foreign key
   * @returns {(string|null)} uuid if set
   */
  get recipientForeignKey() {
    return this._props.recipient_foreign_key || null;
  }

  /**
   * Get data
   * @returns {string} armored pgp message
   */
  get data() {
    return this._props.data;
  }

  /**
   * Get recipient foreign model
   * @returns {(string|null)} i.e. AccountRecoveryOrganizationKey
   */
  get recipientForeignModel() {
    return this._props.recipient_foreign_model;
  }

  /**
   * Get the recipient kes's fingerprint
   * @returns {(string)}
   */
  get recipientFingerprint() {
    return this._props.recipient_fingerprint;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * AccountRecoveryPrivateKeyPasswordEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * AccountRecoveryPrivateKeyPasswordEntity.FOREIGN_MODEL_ORGANIZATION_KEY
   * @returns {string}
   */
  static get FOREIGN_MODEL_ORGANIZATION_KEY() {
    return FOREIGN_MODEL_ORGANIZATION_KEY;
  }
}

export default AccountRecoveryPrivateKeyPasswordEntity;
