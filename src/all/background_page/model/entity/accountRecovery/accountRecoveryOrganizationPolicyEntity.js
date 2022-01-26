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
const {AccountRecoveryOrganizationPublicKeyEntity} = require("./accountRecoveryOrganizationPublicKeyEntity");
const {EntityValidationError} = require("../abstract/entityValidationError");
const {UserEntity} = require("../user/userEntity");

const ENTITY_NAME = "AccountRecoveryOrganizationPolicy";
const POLICY_DISABLED = "disabled";
const POLICY_MANDATORY = "mandatory";
const POLICY_OPT_IN = "opt-in";
const POLICY_OPT_OUT = "opt-out";

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
    if (this._props.account_recovery_organization_revoked_key) {
      this._account_recovery_organization_revoked_key = new AccountRecoveryOrganizationPublicKeyEntity(this._props.account_recovery_organization_revoked_key);
      delete this._props.account_recovery_organization_revoked_key;
    }
    if (this._props.creator) {
      this._creator = new UserEntity(this._props.creator);
      delete this._props.creator;
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
          "enum": [
            AccountRecoveryOrganizationPolicyEntity.POLICY_DISABLED,
            AccountRecoveryOrganizationPolicyEntity.POLICY_MANDATORY,
            AccountRecoveryOrganizationPolicyEntity.POLICY_OPT_IN,
            AccountRecoveryOrganizationPolicyEntity.POLICY_OPT_OUT,
          ]
        },
        "created": {
          "type": "string",
          "format": "date-time"
        },
        "created_by": {
          "type": "string",
          "format": "uuid"
        },
        "modified": {
          "type": "string",
          "format": "date-time"
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
        "account_recovery_organization_revoked_key": AccountRecoveryOrganizationPublicKeyEntity.getSchema(),
        "creator": UserEntity.getSchema(),
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
    if (this._account_recovery_organization_revoked_key && contain.account_recovery_organization_revoked_key) {
      result.account_recovery_organization_revoked_key = this._account_recovery_organization_revoked_key.toDto();
    }
    if (this._creator && contain.creator) {
      result.creator = this._creator.toDto(UserEntity.ALL_CONTAIN_OPTIONS);
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
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto({
      account_recovery_organization_public_key: true,
      creator: true
    });
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */

  /**
   * Get the account recovery organization public key.
   * @returns {AccountRecoveryOrganizationPublicKeyEntity|null}
   */
  get accountRecoveryOrganizationPublicKey() {
    return this._account_recovery_organization_public_key || null;
  }

  get armoredKey() {
    return this._account_recovery_organization_public_key ? this._account_recovery_organization_public_key.armoredKey : null;
  }

  get revokedKey() {
    return this._account_recovery_organization_revoked_key ? this._account_recovery_organization_revoked_key.armoredKey : null;
  }

  get policy() {
    return this._props.policy;
  }

  /**
   * Return true if the account recovery program is disabled.
   * @returns {boolean}
   */
  get isDisabled() {
    return this.policy === AccountRecoveryOrganizationPolicyEntity.POLICY_DISABLED;
  }

  /**
   * Return true if the account recovery program is enabled.
   * @returns {boolean}
   */
  get isEnabled() {
    return !this.isDisabled;
  }

  /**
   * Return true if the account recovery program is enabled in opt-in.
   * @returns {boolean}
   */
  get isOptIn() {
    return this.policy === AccountRecoveryOrganizationPolicyEntity.POLICY_OPT_IN;
  }

  /**
   * Return true if the account recovery program is enabled in opt-out.
   * @returns {boolean}
   */
  get isOptOut() {
    return this.policy === AccountRecoveryOrganizationPolicyEntity.POLICY_OPT_OUT;
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

  /**
   * AccountRecoveryOrganizationPolicyEntity.POLICY_DISABLED
   * @returns {string}
   */
  static get POLICY_DISABLED() {
    return POLICY_DISABLED;
  }

  /**
   * AccountRecoveryOrganizationPolicyEntity.POLICY_MANDATORY
   * @returns {string}
   */
  static get POLICY_MANDATORY() {
    return POLICY_MANDATORY;
  }

  /**
   * AccountRecoveryOrganizationPolicyEntity.POLICY_OPT_IN
   * @returns {string}
   */
  static get POLICY_OPT_IN() {
    return POLICY_OPT_IN;
  }

  /**
   * AccountRecoveryOrganizationPolicyEntity.POLICY_OPT_OUT
   * @returns {string}
   */
  static get POLICY_OPT_OUT() {
    return POLICY_OPT_OUT;
  }
}

exports.AccountRecoveryOrganizationPolicyEntity = AccountRecoveryOrganizationPolicyEntity;
