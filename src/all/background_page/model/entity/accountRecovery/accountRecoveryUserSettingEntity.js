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
const {AccountRecoveryPrivateKeyEntity} = require("./accountRecoveryPrivateKeyEntity");
const {AccountRecoveryPrivateKeyPasswordsCollection} = require("./accountRecoveryPrivateKeyPasswordsCollection");

const ENTITY_NAME = 'AccountRecoveryUserSetting';
const STATUS_APPROVED = 'approved';
const STATUS_REJECTED = 'rejected';
const STATUS_PENDING = 'pending';

class AccountRecoveryUserSettingEntity extends Entity {
  /**
   * Resource entity constructor
   *
   * @param {Object} accountRecoveryUserSettingDto Account recovery user setting DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(accountRecoveryUserSettingDto) {
    super(EntitySchema.validate(
      AccountRecoveryUserSettingEntity.ENTITY_NAME,
      accountRecoveryUserSettingDto,
      AccountRecoveryUserSettingEntity.getSchema()
    ));

    if (this._props.account_recovery_private_key) {
      this._account_recovery_private_key = new AccountRecoveryPrivateKeyEntity(this._props.account_recovery_private_key);
      delete this._props.account_recovery_private_key;
    }
    if (this._props.account_recovery_private_key_passwords) {
      this._account_recovery_private_key_passwords = new AccountRecoveryPrivateKeyPasswordsCollection(this._props.account_recovery_private_key_passwords);
      delete this._props._account_recovery_private_key_passwords;
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
        "status"
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
        "status": {
          "type": "string",
          "enum": [
            AccountRecoveryUserSettingEntity.STATUS_APPROVED,
            AccountRecoveryUserSettingEntity.STATUS_REJECTED,
            AccountRecoveryUserSettingEntity.STATUS_PENDING
          ]
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
        "account_recovery_private_key": AccountRecoveryPrivateKeyEntity.getSchema(),
        "account_recovery_private_key_passwords": AccountRecoveryPrivateKeyPasswordsCollection.getSchema()
      }
    };
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
  toDto(contain) {
    const result = Object.assign({}, this._props);
    if (this._account_recovery_private_key && contain?.account_recovery_private_key) {
      result.account_recovery_private_key = this._account_recovery_private_key.toDto();
    }
    if (this._account_recovery_private_key_passwords && contain?.account_recovery_private_key_passwords) {
      result.account_recovery_private_key_passwords = this._account_recovery_private_key_passwords.toDto();
    }

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
  get status() {
    return this._props.status;
  }

  /**
   * Return true if the user accepted to enroll to the account recovery program
   * @returns {boolean}
   */
  get isApproved() {
    return this.status === AccountRecoveryUserSettingEntity.STATUS_APPROVED;
  }

  /**
   * Return true if the user refused to enroll to the account recovery program
   * @returns {boolean}
   */
  get isRejected() {
    return this.status === AccountRecoveryUserSettingEntity.STATUS_REJECTED;
  }

  /**
   * Return true if the user didn't yet answer to the account recovery program
   * @returns {boolean}
   */
  get isPending() {
    return this.status === AccountRecoveryUserSettingEntity.STATUS_PENDING;
  }

  /*
   * ==================================================
   * Dynamic properties setters
   * ==================================================
   */

  /**
   * Get the user account recovery private key
   * @returns {(AccountRecoveryPrivateKey|null)}
   */
  get accountRecoveryPrivateKey() {
    return this._account_recovery_private_key || null;
  }

  /**
   * Set the associated account recovery private key
   * @param {AccountRecoveryPrivateKeyEntity} accountRecoveryPrivateKey
   */
  set accountRecoveryPrivateKey(accountRecoveryPrivateKey) {
    if (!accountRecoveryPrivateKey || !(accountRecoveryPrivateKey instanceof AccountRecoveryPrivateKeyEntity)) {
      throw new TypeError('Failed to assert the parameter is a valid AccountRecoveryPrivateKeyEntity');
    }
    this._account_recovery_private_key = accountRecoveryPrivateKey;
  }

  /**
   * Get the user account recovery private key passwords
   * @returns {(AccountRecoveryPrivateKeyPasswordsCollection|null)}
   */
  get accountRecoveryPrivateKeyPasswords() {
    return this._account_recovery_private_key_passwords || null;
  }

  /**
   * Set the associated account recovery private key passwords
   * @param {AccountRecoveryPrivateKeyPasswordsCollection} accountRecoveryPrivateKeyPasswords
   */
  set accountRecoveryPrivateKeyPasswords(accountRecoveryPrivateKeyPasswords) {
    if (!accountRecoveryPrivateKeyPasswords || !(accountRecoveryPrivateKeyPasswords instanceof AccountRecoveryPrivateKeyPasswordsCollection)) {
      throw new TypeError('Failed to assert the parameter is a valid AccountRecoveryPrivateKeyPasswordsCollection');
    }
    this._account_recovery_private_key_passwords = accountRecoveryPrivateKeyPasswords;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * AccountRecoveryUserSettingEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * AccountRecoveryUserSettingEntity.STATUS_APPROVED
   * @returns {string}
   */
  static get STATUS_APPROVED() {
    return STATUS_APPROVED;
  }

  /**
   * AccountRecoveryUserSettingEntity.STATUS_REJECTED
   * @returns {number}
   */
  static get STATUS_REJECTED() {
    return STATUS_REJECTED;
  }

  /**
   * AccountRecoveryUserSettingEntity.PERMISSION_UPDATE
   * @returns {number}
   */
  static get STATUS_PENDING() {
    return STATUS_PENDING;
  }
}

exports.AccountRecoveryUserSettingEntity = AccountRecoveryUserSettingEntity;
