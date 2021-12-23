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
 * @since         3.5.0
 */
const {Entity} = require('../abstract/entity');
const {EntitySchema} = require('../abstract/entitySchema');

const ENTITY_NAME = "AccountRecoveryPrivateKeyPassword";

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
        "recipient_foreign_key",
        "data"
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "recipient_foreign_model": {
          "type": "string",
          "enum": ["AccountRecoveryContact",  "AccountRecoveryOrganizationKey"]
        },
        "recipient_foreign_key": {
          "type": "string",
          "format": "uuid"
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
  get id() {
    return this._props.id || null;
  }

  get recipient_foreign_key() {
    return this._props.recipient_foreign_key || null;
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
}

exports.AccountRecoveryPrivateKeyPasswordEntity = AccountRecoveryPrivateKeyPasswordEntity;
