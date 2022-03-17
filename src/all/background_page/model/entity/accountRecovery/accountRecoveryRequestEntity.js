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
const {Entity} = require("../abstract/entity");
const {EntitySchema} = require("../abstract/entitySchema");
const {AccountRecoveryPrivateKeyPasswordsCollection} = require("./accountRecoveryPrivateKeyPasswordsCollection");

const ENTITY_NAME = "AccountRecoveryRequest";
const FINGERPRINT_LENGTH = 40;
const STATUS_PENDING = "pending";
const STATUS_REJECTED = "rejected";
const STATUS_APPROVED = "approved";
const STATUS_COMPLETED = "completed";

class AccountRecoveryRequestEntity extends Entity {
  /**
   * AccountRecoveryRequestEntity entity constructor
   *
   * @param {Object} accountRecoveryRequestDto account recovery request DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(accountRecoveryRequestDto) {
    super(EntitySchema.validate(
      AccountRecoveryRequestEntity.ENTITY_NAME,
      accountRecoveryRequestDto,
      AccountRecoveryRequestEntity.getSchema()
    ));

    // Associations
    if (this._props.account_recovery_private_key_passwords) {
      this._account_recovery_private_key_passwords = new AccountRecoveryPrivateKeyPasswordsCollection(this._props.account_recovery_private_key_passwords);
      delete this._props.account_recovery_private_key_passwords;
    }
  }

  /**
   * Get resource entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "id",
        "authentication_token_id",
        "status",
        "created",
        "created_by",
        "modified",
        "modified_by"
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "user_id": {
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
        "authentication_token_id": {
          "type": "string",
          "format": "uuid"
        },
        "status": {
          "type": "string",
          "enum": [STATUS_PENDING, STATUS_REJECTED, STATUS_APPROVED, STATUS_COMPLETED]
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
    return this.toDto(AccountRecoveryRequestEntity.ALL_CONTAIN_OPTIONS);
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
   * Get the armored key
   * @returns {string} armored_key
   */
  get armoredKey() {
    return this._props.armored_key;
  }

  /**
   * AccountRecoveryRequestEntity.ALL_CONTAIN_OPTIONS
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
   * ResourceEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /*
   * ==================================================
   * Associated properties getters
   * ==================================================
   */
  /**
   * Get the account recovery private key passwords
   * @returns {AccountRecoveryPrivateKeyPasswordsCollection || null} account_recovery_private_key_passwords
   */
  get accountRecoveryPrivateKeyPasswords() {
    return this._account_recovery_private_key_passwords || null;
  }
}

exports.AccountRecoveryRequestEntity = AccountRecoveryRequestEntity;
