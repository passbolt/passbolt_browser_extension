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
const {AccountRecoveryPrivateKeyPasswordsCollection} = require("./accountRecoveryPrivateKeyPasswordsCollection");

const ENTITY_NAME = 'AccountRecoveryResponse';
const STATUS_REJECTED = "rejected";
const STATUS_APPROVED = "approved";
const RESPONDER_FOREIGN_MODEL_ORGANIZATION_KEY = "AccountRecoveryOrganizationKey";

class AccountRecoveryResponseEntity extends Entity {
  /**
   * AccountRecoveryResponseEntity entity constructor
   *
   * @param {Object} accountRecoveryResponseDto account recovery Response DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(accountRecoveryResponseDto) {
    super(EntitySchema.validate(
      AccountRecoveryResponseEntity.ENTITY_NAME,
      accountRecoveryResponseDto,
      AccountRecoveryResponseEntity.getSchema()
    ));

    // Associations
    if (this._props.account_recovery_private_key_passwords) {
      this._account_recovery_private_key_passwords = new AccountRecoveryPrivateKeyPasswordsCollection(this._props.account_recovery_private_key_passwords);
      delete this._props.account_recovery_private_key_passwords;
    }
  }

  /**
   * Get entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "account_recovery_request_id",
        "responder_foreign_key",
        "responder_foreign_model",
        "status"
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "account_recovery_request_id": {
          "type": "string",
          "format": "uuid"
        },
        "responder_foreign_key": {
          "type": "string",
          "format": "uuid"
        },
        "responder_foreign_model": {
          "type": "string",
          "enum": [RESPONDER_FOREIGN_MODEL_ORGANIZATION_KEY]
        },
        "data": {
          "type": "string",
        },
        "status": {
          "type": "string",
          "enum": [STATUS_REJECTED, STATUS_APPROVED]
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
        // Associated models
        "account_recovery_private_key_passwords": AccountRecoveryPrivateKeyPasswordsCollection.getSchema()
      }
    };
  }

  /*
   * ==================================================
   * Sanitization
   * ==================================================
   */
  /**
   * Sanitize account recovery request dto:
   * - Remove account recovery request which don't validate if any.
   *
   * @param {object} dto the account recovery request dto
   * @returns {object}
   */
  static sanitizeDto(dto) {
    if (typeof dto !== "object") {
      return dto;
    }

    if (Object.prototype.hasOwnProperty.call(dto, 'account_recovery_private_key_passwords')) {
      dto.account_recovery_private_key_passwords = AccountRecoveryPrivateKeyPasswordsCollection.sanitizeDto(dto.account_recovery_private_key_passwords);
    }

    return dto;
  }

  /*
   * ==================================================
   * Serialization
   * ==================================================
   */
  /**
   * Return a DTO ready to be sent to API
   * @param {object} [contain] optional for example {user: true}
   * @returns {*}
   */
  toDto(contain) {
    const result = Object.assign({}, this._props);
    if (!contain) {
      return result;
    }
    if (this.accountRecoveryPrivateKeyPasswords && contain.account_recovery_private_key_passwords) {
      result.account_recovery_private_key_passwords = this.accountRecoveryPrivateKeyPasswords.toDto();
    }
    return result;
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto(AccountRecoveryResponseEntity.ALL_CONTAIN_OPTIONS);
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */
  /**
   * Get the id
   * @returns {string}
   */
  get id() {
    return this._props.id;
  }

  /**
   * Get the status
   * @returns {string} status
   */
  get status() {
    return this._props.status;
  }

  /**
   * AccountRecoveryResponseEntity.ALL_CONTAIN_OPTIONS
   * @returns {object} all contain options that can be used in toDto()
   */
  static get ALL_CONTAIN_OPTIONS() {
    return {account_recovery_private_key_passwords: true};
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * AccountRecoveryResponseEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * AccountRecoveryResponseEntity.STATUS_APPROVED
   * @returns {string}
   */
  static get STATUS_APPROVED() {
    return STATUS_APPROVED;
  }

  /**
   * AccountRecoveryResponseEntity.STATUS_REJECTED
   * @returns {string}
   */
  static get STATUS_REJECTED() {
    return STATUS_REJECTED;
  }

  /**
   * Get the account recovery private key passwords
   * @returns {AccountRecoveryPrivateKeyPasswordsCollection || null} account_recovery_private_key_passwords
   */
  get accountRecoveryPrivateKeyPasswords() {
    return this._account_recovery_private_key_passwords || null;
  }
}

exports.AccountRecoveryResponseEntity = AccountRecoveryResponseEntity;
