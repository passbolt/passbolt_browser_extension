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
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import {OpenpgpAssertion} from "../../../utils/openpgp/openpgpAssertions";
import AccountRecoveryPrivateKeyPasswordsCollection from "./accountRecoveryPrivateKeyPasswordsCollection";
import UserEntity from "../user/userEntity";
import AccountRecoveryOrganizationPublicKeyEntity from "./accountRecoveryOrganizationPublicKeyEntity";

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
      AccountRecoveryOrganizationPolicyEntity.assertValidAccountRecoveryOrganizationPublicKey(this._account_recovery_organization_public_key, this.public_key_id);
      delete this._props.account_recovery_organization_public_key;
    }
    if (this._props.account_recovery_organization_revoked_key) {
      this._account_recovery_organization_revoked_key = new AccountRecoveryOrganizationPublicKeyEntity(this._props.account_recovery_organization_revoked_key);
      delete this._props.account_recovery_organization_revoked_key;
    }
    if (this._props.account_recovery_private_key_passwords) {
      this._account_recovery_private_key_passwords = new AccountRecoveryPrivateKeyPasswordsCollection(this._props.account_recovery_private_key_passwords);
      delete this._props.account_recovery_private_key_passwords;
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
        "public_key_id": {
          "anyOf": [{
            "type": "string",
            "format": "uuid"
          }, {
            "type": "null"
          }]
        },
        "account_recovery_organization_public_key": AccountRecoveryOrganizationPublicKeyEntity.getSchema(),
        "account_recovery_organization_revoked_key": AccountRecoveryOrganizationPublicKeyEntity.getSchema(),
        "account_recovery_private_key_passwords": AccountRecoveryPrivateKeyPasswordsCollection.getSchema(),
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
    if (this._account_recovery_private_key_passwords && contain.account_recovery_private_key_passwords) {
      result.account_recovery_private_key_passwords = this._account_recovery_private_key_passwords.toDto();
    }
    if (this._creator && contain.creator) {
      result.creator = this._creator.toDto(UserEntity.ALL_CONTAIN_OPTIONS);
    }
    return result;
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto({
      account_recovery_organization_public_key: true,
      account_recovery_organization_revoked_key: true,
      account_recovery_private_key_passwords: true,
      creator: true
    });
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
   * Additional AccountRecoveryOrganizationPolicyEntity validation rule.
   *  Check that the creator is defined
   *  Check that the creator.gpgkey is defined
   *  Check that the creator id is matching the gpgkey.user_id
   *  Check that the creator key's fingerprint is defined
   *  Check that the given creator's key is matching the givent fingerprint
   * @param {AccountRecoveryOrganizationPolicyEntity} entity
   * @throws {Error} if creator is not defined
   * @throws {Error} if creator.gpgkey is not defined
   * @throws {Error} if creator id is not the same as the creator.gpgkey user_id
   * @throws {Error} if declared fingerprint in gpgkey does not match the key itself
   */
  static async assertValidCreatorGpgkey(entity) {
    const creator = entity.creator;
    if (!creator) {
      throw new EntityValidationError('AccountRecoveryOrganizationPolicyEntity assertValidCreatorGpgkey expects a creator to be defined.');
    }

    const gpgkey = creator.gpgkey;
    if (!gpgkey) {
      throw new EntityValidationError('AccountRecoveryOrganizationPolicyEntity assertValidCreatorGpgkey expects a creator.gpgkey to be defined.');
    }

    if (creator.id !== gpgkey.userId) {
      throw new EntityValidationError("AccountRecoveryOrganizationPolicyEntity assertValidCreatorGpgkey expects the creator's id to match the gpgkey.user_id.");
    }

    const key = await OpenpgpAssertion.readKeyOrFail(gpgkey.armoredKey);
    const computedFingerprint = key.getFingerprint().toUpperCase();
    if (computedFingerprint !== gpgkey.fingerprint.toUpperCase()) {
      throw new EntityValidationError("AccountRecoveryOrganizationPolicyEntity assertValidCreatorGpgkey expects the gpgkey armoredKey's fingerprint to match the given fingerprint.");
    }
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

  /**
   * Get the id of the account recovery organization public key.
   * @returns {string}
   */
  get publicKeyId() {
    return this._props.public_key_id;
  }

  /**
   * Get the account recovery organization public armored key.
   * @returns {string|null}
   */
  get armoredKey() {
    return this._account_recovery_organization_public_key ? this._account_recovery_organization_public_key.armoredKey : null;
  }

  /**
   * Get the previous account recovery organization revoked armored key.
   * @returns {string|null}
   */
  get revokedKey() {
    return this._account_recovery_organization_revoked_key ? this._account_recovery_organization_revoked_key.armoredKey : null;
  }

  /**
   * Get the current account recovery organization policy.
   * @returns {string}
   */
  get policy() {
    return this._props.policy;
  }

  /**
   * Get the collection of private key passwords.
   * @returns {AccountRecoveryPrivateKeyPasswordsCollection|null}
   */
  get privateKeyPasswords() {
    return this._account_recovery_private_key_passwords ? this._account_recovery_private_key_passwords : null;
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

  /**
   * Return the creator of the organization policy.
   * @returns {UserEntity}
   */
  get creator() {
    return this._creator;
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

  /**
   * AccountRecoveryOrganizationPolicyEntity.ALL_CONTAIN_OPTIONS
   * @returns {object} all contain options that can be used in toDto()
   */
  static get ALL_CONTAIN_OPTIONS() {
    return {
      account_recovery_organization_public_key: true,
      account_recovery_organization_revoked_key: true,
      account_recovery_private_key_passwords: true,
      creator: true,
    };
  }
}

export default AccountRecoveryOrganizationPolicyEntity;
