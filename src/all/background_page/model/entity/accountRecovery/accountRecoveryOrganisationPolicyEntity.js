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
const {AccountRecoveryOrganisationPublicKeyEntity} = require("./accountRecoveryOrganisationPublicKeyEntity");
const {AccountRecoveryPrivateKeyPasswordsCollection} = require("./accountRecoveryPrivateKeyPasswordsCollection");
const {EntityValidationError} = require("../abstract/entityValidationError");

const ENTITY_NAME = "AccountRecoveryOrganisationPolicy";

/**
 * Entity related to the account recovery organisation policy
 */
class AccountRecoveryOrganisationPolicyEntity extends Entity {
  /**
   * Setup entity constructor
   *
   * @param {Object} accountRecoveryOrganisationPolicyDto account recovery organisation policy DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(accountRecoveryOrganisationPolicyDto) {
    super(EntitySchema.validate(
      AccountRecoveryOrganisationPolicyEntity.ENTITY_NAME,
      accountRecoveryOrganisationPolicyDto,
      AccountRecoveryOrganisationPolicyEntity.getSchema()
    ));
    // Associations
    if (this._props.account_recovery_organization_key) {
      this._account_recovery_organization_key = new AccountRecoveryOrganisationPublicKeyEntity(this._props.account_recovery_organization_key);
      AccountRecoveryOrganisationPolicyEntity.assertValidAccountRecoveryOrganisationPublicKey(this._account_recovery_organization_key, this.account_recovery_organization_key_id);
      delete this._props.account_recovery_organization_key;
    }
    if (this._props.account_recovery_private_key_passwords) {
      this._account_recovery_private_key_passwords = new AccountRecoveryPrivateKeyPasswordsCollection(this._props.account_recovery_private_key_passwords);
      AccountRecoveryOrganisationPolicyEntity.assertValidAccountRecoveryPrivateKeyPasswords(this._account_recovery_private_key_passwords);
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
        "account_recovery_organization_key_id": {
          "type": "string",
          "format": "uuid"
        },
        "account_recovery_organization_key": AccountRecoveryOrganisationPublicKeyEntity.getSchema(),
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
    if (this._account_recovery_organization_key && contain.account_recovery_organization_key) {
      result.account_recovery_organization_key = this._account_recovery_organization_key.toDto();
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
   * Additional AccountRecoveryOrganisationPublicKey validation rule
   * Check that the accountRecoveryOrganisationPublicKey is for a resource
   * Check that id match foreignKey if any
   *
   * @param {AccountRecoveryOrganisationPublicKeyEntity} accountRecoveryOrganisationPublicKey
   * @param {string} [accountRecoveryOrganizationKeyId] optional
   * @throws {EntityValidationError} if not valid
   */
  static assertValidAccountRecoveryOrganisationPublicKey(accountRecoveryOrganisationPublicKey, accountRecoveryOrganizationKeyId) {
    if (!accountRecoveryOrganisationPublicKey) {
      throw new EntityValidationError('AccountRecoveryOrganisationPolicyEntity assertValidAccountRecoveryOrganisationPublicKey expect an accountRecoveryOrganisationPublicKey.');
    }
    if (accountRecoveryOrganizationKeyId && (accountRecoveryOrganisationPublicKey.id !== accountRecoveryOrganizationKeyId)) {
      throw new EntityValidationError('AccountRecoveryOrganisationPolicyEntity assertValidPermission resource id doesnt not match foreign key permission.');
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
      throw new EntityValidationError('AccountRecoveryOrganisationPolicyEntity assertValidSecrets cannot be empty.');
    }
    if (!(accountRecoveryPrivateKeyPasswords instanceof AccountRecoveryPrivateKeyPasswordsCollection)) {
      throw new EntityValidationError('AccountRecoveryOrganisationPolicyEntity assertValidSecrets expect a AccountRecoveryPrivateKeyPasswordsCollection.');
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

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * AccountRecoveryOrganisationPolicyEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

exports.AccountRecoveryOrganisationPolicyEntity = AccountRecoveryOrganisationPolicyEntity;
