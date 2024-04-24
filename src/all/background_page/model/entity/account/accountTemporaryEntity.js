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
 * @since         4.7.0
 */

import AbstractAccountEntity from "./abstractAccountEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import AccountAccountRecoveryEntity from "./accountAccountRecoveryEntity";
import AccountSetupEntity from "./accountSetupEntity";
import AccountRecoverEntity from "./accountRecoverEntity";
import AccountRecoveryOrganizationPolicyEntity from "../accountRecovery/accountRecoveryOrganizationPolicyEntity";
import UserPassphrasePoliciesEntity from "passbolt-styleguide/src/shared/models/entity/userPassphrasePolicies/userPassphrasePoliciesEntity";

const ENTITY_NAME = "AccountTemporary";

class AccountTemporaryEntity extends AbstractAccountEntity {
  /**
   * @inheritDoc
   */
  constructor(AccountEntityDto) {
    super(EntitySchema.validate(
      AccountTemporaryEntity.ENTITY_NAME,
      AccountEntityDto,
      AccountTemporaryEntity.getSchema()
    ));

    // Associations
    if (this._props.account) {
      switch (this._props.account.type) {
        case AccountSetupEntity.TYPE_ACCOUNT_SETUP:
          this._account = new AccountSetupEntity(this._props.account,  {clone: false});
          break;
        case AccountRecoverEntity.TYPE_ACCOUNT_RECOVER:
          this._account = new AccountRecoverEntity(this._props.account, {clone: false});
          break;
        case AccountAccountRecoveryEntity.TYPE_ACCOUNT_ACCOUNT_RECOVERY:
          this._account = new AccountAccountRecoveryEntity(this._props.account, {clone: false});
          break;
        default:
          throw new TypeError('The account should have a known type.');
      }
      delete this._props.account;
    }

    if (this._props.account_recovery_organization_policy) {
      this._account_recovery_organization_policy = new AccountRecoveryOrganizationPolicyEntity(this._props.account_recovery_organization_policy, {clone: false});
      delete this._props.account_recovery_organization_policy;
    }

    if (this._props.user_passphrase_policies) {
      this._user_passphrase_policies = new UserPassphrasePoliciesEntity(this._props.user_passphrase_policies, {clone: false});
      delete this._props.user_passphrase_policies;
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
        "worker_id",
        "account"
      ],
      "properties": {
        "account": {"anyOf": [
          AccountSetupEntity.getSchema(),
          AccountRecoverEntity.getSchema(),
          AccountAccountRecoveryEntity.getSchema()
        ]},
        "passphrase": {
          "type": "string",
        },
        "worker_id": {
          "type": "string",
          "format": "uuid"
        },
        "account_recovery_organization_policy": AccountRecoveryOrganizationPolicyEntity.getSchema(),
        "user_passphrase_policies": UserPassphrasePoliciesEntity.getSchema(),
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
   * @param {Object} contains The contains
   * @returns {object}
   */
  toDto(contains = {}) {
    const result = Object.assign({}, this._props);

    // Ensure some properties are not leaked by default and require an explicit contain.
    delete result.passphrase;
    delete result.worker_id;

    if (!contains) {
      return result;
    }

    if (contains.account) {
      switch (this.account.type) {
        case AccountSetupEntity.TYPE_ACCOUNT_SETUP:
          result.account = this.account.toDto(AccountSetupEntity.ALL_CONTAIN_OPTIONS);
          break;
        case AccountRecoverEntity.TYPE_ACCOUNT_RECOVER:
          result.account = this.account.toDto(AccountRecoverEntity.ALL_CONTAIN_OPTIONS);
          break;
        case AccountAccountRecoveryEntity.TYPE_ACCOUNT_ACCOUNT_RECOVERY:
          result.account = this.account.toDto(AccountAccountRecoveryEntity.ALL_CONTAIN_OPTIONS);
          break;
      }
    }
    if (contains.passphrase && this.passphrase) {
      result.passphrase = this.passphrase;
    }
    if (contains.worker_id) {
      result.worker_id = this.workerId;
    }
    if (contains.account_recovery_organization_policy && this.accountRecoveryOrganizationPolicy) {
      result.account_recovery_organization_policy = this.accountRecoveryOrganizationPolicy.toDto(AccountRecoveryOrganizationPolicyEntity.ALL_CONTAIN_OPTIONS);
    }
    if (contains.user_passphrase_policies && this.userPassphrasePolicies) {
      result.user_passphrase_policies = this.userPassphrasePolicies.toDto();
    }

    return result;
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */

  /**
   * Get the worker Id.
   * @return {string}
   */
  get workerId() {
    return this._props.worker_id;
  }

  /**
   * Get the passphrase.
   * @return {string|null}
   */
  get passphrase() {
    return this._props.passphrase || null;
  }

  /**
   * Set the passphrase.
   * @param {string} passphrase The passphrase
   */
  set passphrase(passphrase) {
    this._props.passphrase = passphrase;
  }

  /*
   * ==================================================
   * Other associated properties methods
   * ==================================================
   */

  /**
   * Get the associated account
   * @returns {(AccountSetupEntity|AccountRecoverEntity|AccountAccountRecoveryEntity)}
   */
  get account() {
    return this._account;
  }

  /**
   * Get the account recovery organization policy
   * @returns {(AccountRecoveryOrganizationPolicyEntity|null)}
   */
  get accountRecoveryOrganizationPolicy() {
    return this._account_recovery_organization_policy || null;
  }

  /**
   * Set the account recovery organization policy
   * @param {AccountRecoveryOrganizationPolicyEntity} accountRecoveryOrganizationPolicy The account recovery organization policy
   * @throws {TypeError} If the accountRecoveryOrganizationPolicy parameter is not a valid AccountRecoveryOrganizationPolicyEntity
   */
  set accountRecoveryOrganizationPolicy(accountRecoveryOrganizationPolicy) {
    if (!accountRecoveryOrganizationPolicy || !(accountRecoveryOrganizationPolicy instanceof AccountRecoveryOrganizationPolicyEntity)) {
      throw new TypeError('Failed to assert the parameter is a valid AccountRecoveryOrganizationPolicyEntity');
    }
    this._account_recovery_organization_policy = accountRecoveryOrganizationPolicy;
  }

  /**
   * Get the user passphrase policy
   * @returns {(UserPassphrasePoliciesEntity|null)}
   */
  get userPassphrasePolicies() {
    return this._user_passphrase_policies || null;
  }

  /**
   * Set the user passphrase policy
   * @param {UserPassphrasePoliciesEntity} userPassphrasePolicy The account recovery organization policy
   * @throws {TypeError} If the userPassphrasePolicy parameter is not a valid UserPassphrasePoliciesEntity
   */
  set userPassphrasePolicies(userPassphrasePolicy) {
    if (!userPassphrasePolicy || !(userPassphrasePolicy instanceof UserPassphrasePoliciesEntity)) {
      throw new TypeError('Failed to assert the parameter is a valid UserPassphrasePoliciesEntity');
    }
    this._user_passphrase_policies = userPassphrasePolicy;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */

  /**
   * AccountTemporaryEntity.ALL_CONTAIN_OPTIONS
   * @returns {object} all contain options that can be used in toDto()
   */
  static get ALL_CONTAIN_OPTIONS() {
    return {
      passphrase: true,
      worker_id: true,
      account: true,
      account_recovery_organization_policy: true,
      user_passphrase_policies: true,
    };
  }

  /**
   * AccountTemporaryEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default AccountTemporaryEntity;
