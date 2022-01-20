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
 * @since         3.6.0
 */
const {Entity} = require('../abstract/entity');
const {EntitySchema} = require('../abstract/entitySchema');

const ENTITY_NAME = "AccountRecoveryPrivateKeyPassword";
const FOREIGN_MODEL_ORGANIZATION_KEY = "AccountRecoveryOrganizationKey";

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
        "data"
      ],
      "properties": {
        "id": {
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

  /**
   * AccountRecoveryPrivateKeyPasswordEntity.FOREIGN_MODEL_ORGANIZATION_KEY
   * @returns {string}
   */
  static get FOREIGN_MODEL_ORGANIZATION_KEY() {
    return FOREIGN_MODEL_ORGANIZATION_KEY;
  }
}

exports.AccountRecoveryPrivateKeyPasswordEntity = AccountRecoveryPrivateKeyPasswordEntity;
