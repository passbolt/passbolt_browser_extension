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
import AccountRecoveryOrganizationPolicyEntity from "./accountRecoveryOrganizationPolicyEntity";
import AccountRecoveryOrganizationPublicKeyEntity from "./accountRecoveryOrganizationPublicKeyEntity";

const ENTITY_NAME = "AccountRecoveryOrganizationChangePolicy";

/**
 * Entity related to the account recovery organization policy
 */
class AccountRecoveryOrganizationPolicyChangeEntity extends Entity {
  /**
   * Setup entity constructor
   *
   * @param {Object} accountRecoveryOrganizationPolicyChangeDto account recovery organization policy DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(accountRecoveryOrganizationPolicyChangeDto) {
    super(EntitySchema.validate(
      AccountRecoveryOrganizationPolicyChangeEntity.ENTITY_NAME,
      accountRecoveryOrganizationPolicyChangeDto,
      AccountRecoveryOrganizationPolicyChangeEntity.getSchema()
    ));

    if (!accountRecoveryOrganizationPolicyChangeDto.policy && !accountRecoveryOrganizationPolicyChangeDto.account_recovery_organization_public_key) {
      throw new EntityValidationError("AccountRecoveryOrganizationPolicyChangeEntity expects a policy or an account_recovery_organization_public_key set to be valid.");
    }

    if (accountRecoveryOrganizationPolicyChangeDto.policy === AccountRecoveryOrganizationPolicyEntity.POLICY_DISABLED && accountRecoveryOrganizationPolicyChangeDto.account_recovery_organization_public_key) {
      throw new EntityValidationError("AccountRecoveryOrganizationPolicyChangeEntity expects not to have an account recovery organization public key if the policy type is disabled.");
    }

    // Associations
    if (this._props.account_recovery_organization_public_key) {
      this._account_recovery_organization_public_key = new AccountRecoveryOrganizationPublicKeyEntity(this._props.account_recovery_organization_public_key);
      AccountRecoveryOrganizationPolicyEntity.assertValidAccountRecoveryOrganizationPublicKey(this._account_recovery_organization_public_key, this.public_key_id);
      delete this._props.account_recovery_organization_public_key;
    }
  }

  /**
   * Get entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    const accountRecoveryOrganizationPolicyEntitySchema = AccountRecoveryOrganizationPolicyEntity.getSchema();
    return {
      "type": "object",
      "required": [],
      "properties": {
        "policy": accountRecoveryOrganizationPolicyEntitySchema.properties.policy,
        "account_recovery_organization_public_key": AccountRecoveryOrganizationPublicKeyEntity.getSchema(),
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
    return result;
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto({
      account_recovery_organization_public_key: true
    });
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */

  /**
   * Get the new account recovery organization policy type if any.
   * @returns {string|null}
   */
  get policy() {
    return this._props.policy || null;
  }

  /**
   * Get the new account recovery organization public key if any.
   * @returns {AccountRecoveryOrganizationPublicKeyEntity|null}
   */
  get accountRecoveryOrganizationPublicKey() {
    return this._account_recovery_organization_public_key || null;
  }

  /**
   * Get the new account recovery organization public armored key if any.
   * @returns {string|null}
   */
  get armoredKey() {
    return this._account_recovery_organization_public_key?.armoredKey || null;
  }

  /**
   * Return true if the account recovery program is disabled.
   * @returns {boolean}
   */
  get isDisabled() {
    if (this.policy) {
      return this.policy === AccountRecoveryOrganizationPolicyEntity.POLICY_DISABLED;
    }
    //No policy is defined so there is an ORK defined meaning that it's an enabled policy;
    return false;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * AccountRecoveryOrganizationPolicyChangeEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default AccountRecoveryOrganizationPolicyChangeEntity;
