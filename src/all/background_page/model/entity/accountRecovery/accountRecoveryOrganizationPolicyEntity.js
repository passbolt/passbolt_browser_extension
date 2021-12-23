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
const {AccountRecoveryOrganizationPublicKeyEntity} = require("./accountRecoveryOrganizationPublicKeyEntity");
const {AccountRecoveryPrivateKeyPasswordsCollection} = require("./accountRecoveryPrivateKeyPasswordsCollection");
const {EntityValidationError} = require("../abstract/entityValidationError");

const ENTITY_NAME = "AccountRecoveryOrganizationPolicy";

/**
 * Entity related to the account recovery organization policy
 */
class AccountRecoveryOrganizationPolicyEntity extends Entity {
  /**
   * Setup entity constructor
   *
   * @param {Object} accountRecoveryOrganizationPolicyDto account recovery organization policy DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(accountRecoveryOrganizationPolicyDto) {
    super(EntitySchema.validate(
      AccountRecoveryOrganizationPolicyEntity.ENTITY_NAME,
      accountRecoveryOrganizationPolicyDto,
      AccountRecoveryOrganizationPolicyEntity.getSchema()
    ));
    // Associations
    if (this._props.account_recovery_organization_public_key) {
      this._account_recovery_organization_public_key = new AccountRecoveryOrganizationPublicKeyEntity(this._props.account_recovery_organization_public_key);
      AccountRecoveryOrganizationPolicyEntity.assertValidAccountRecoveryOrganizationPublicKey(this._account_recovery_organization_public_key, this.account_recovery_organization_public_key_id);
      delete this._props.account_recovery_organization_public_key;
    }
    if (this._props.account_recovery_private_key_passwords) {
      this._account_recovery_private_key_passwords = new AccountRecoveryPrivateKeyPasswordsCollection(this._props.account_recovery_private_key_passwords);
      AccountRecoveryOrganizationPolicyEntity.assertValidAccountRecoveryPrivateKeyPasswords(this._account_recovery_private_key_passwords);
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
        "policy"
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "policy": {
          "type": "string",
          "enum": ["opt-in", "opt-out", "disabled", "mandatory"]
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
        "account_recovery_organization_public_key_id": {
          "type": "string",
          "format": "uuid"
        },
        "account_recovery_organization_public_key": AccountRecoveryOrganizationPublicKeyEntity.getSchema(),
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
    if (!contain) {
      return result;
    }
    if (this._account_recovery_organization_public_key && contain.account_recovery_organization_public_key) {
      result.account_recovery_organization_public_key = this._account_recovery_organization_public_key.toDto();
    }
    if (this._account_recovery_private_key_passwords && contain.account_recovery_private_key_passwords) {
      result.account_recovery_private_key_passwords = this._account_recovery_private_key_passwords.toDto();
    }
    return result;
  }

  /*
   * ==================================================
   * Build rules
   * ==================================================
   */
  /**
   * Additional AccountRecoveryOrganizationPublicKey validation rule
   * Check that the accountRecoveryOrganizationPublicKey is for a resource
   * Check that id match foreignKey if any
   *
   * @param {AccountRecoveryOrganizationPublicKeyEntity} accountRecoveryOrganizationPublicKey
   * @param {string} [accountRecoveryOrganizationKeyId] optional
   * @throws {EntityValidationError} if not valid
   */
  static assertValidAccountRecoveryOrganizationPublicKey(accountRecoveryOrganizationPublicKey, accountRecoveryOrganizationKeyId) {
    if (!accountRecoveryOrganizationPublicKey) {
      throw new EntityValidationError('AccountRecoveryOrganizationPolicyEntity assertValidAccountRecoveryOrganizationPublicKey expect an accountRecoveryOrganizationPublicKey.');
    }
    if (accountRecoveryOrganizationKeyId && (accountRecoveryOrganizationPublicKey.id !== accountRecoveryOrganizationKeyId)) {
      throw new EntityValidationError('AccountRecoveryOrganizationPolicyEntity assertValidPermission resource id doesnt not match foreign key permission.');
    }
  }

  /**
   * Additional secret validation rule
   *
   * @param {AccountRecoveryPrivateKeyPasswordsCollection} accountRecoveryPrivateKeyPasswords
   * @throws {EntityValidationError} if not valid
   */
  static assertValidAccountRecoveryPrivateKeyPasswords(accountRecoveryPrivateKeyPasswords) {
    if (!accountRecoveryPrivateKeyPasswords || !accountRecoveryPrivateKeyPasswords.length) {
      throw new EntityValidationError('AccountRecoveryOrganizationPolicyEntity assertValidSecrets cannot be empty.');
    }
    if (!(accountRecoveryPrivateKeyPasswords instanceof AccountRecoveryPrivateKeyPasswordsCollection)) {
      throw new EntityValidationError('AccountRecoveryOrganizationPolicyEntity assertValidSecrets expect a AccountRecoveryPrivateKeyPasswordsCollection.');
    }
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
    return this._account_recovery_organization_public_key.armoredKey;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * AccountRecoveryOrganizationPolicyEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

exports.AccountRecoveryOrganizationPolicyEntity = AccountRecoveryOrganizationPolicyEntity;
