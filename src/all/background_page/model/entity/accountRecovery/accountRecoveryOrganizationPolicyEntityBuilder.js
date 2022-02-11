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

const {AccountRecoveryOrganizationPolicyEntity} = require("./accountRecoveryOrganizationPolicyEntity");
const {ExternalGpgKeyCollection} = require("../../entity/gpgkey/external/externalGpgKeyCollection");

/**
 * Entity related to the account recovery organization policy
 */
class AccountRecoveryOrganizationPolicyEntityBuilder {
  /**
   * Contructs an AccountRecoveryOrganizationPolicyEntityBuilder with the minimum required information.
   *
   * @param {AccountRecoveryOrganizationPolicyEntity} newAccountRecoveryOrganizationPolicyEntity
   * @param {AccountRecoveryOrganizationPolicyEntity} currentAccountRecoveryOrganisationPolicyEntity
   */
  constructor(newAccountRecoveryOrganizationPolicyEntity, currentAccountRecoveryOrganisationPolicyEntity) {
    if (!newAccountRecoveryOrganizationPolicyEntity) {
      throw new Error("A non null new account recovery organization policy entity is required.");
    }
    if (!currentAccountRecoveryOrganisationPolicyEntity) {
      throw new Error("A non null current account recovery organization policy entity is required.");
    }

    this.signingKeys = new ExternalGpgKeyCollection([]);
    this.newOrganizationPolicy = newAccountRecoveryOrganizationPolicyEntity;
    this.currentOrganizationPolicy = currentAccountRecoveryOrganisationPolicyEntity;
  }

  /**
   * Sets the reovked ORK.
   *
   * @param {string} revokedORK the armored key of the current ORK revoked.
   * @returns {AccountRecoveryOrganizationPolicyEntityBuilder}
   */
  withCurrentORKRevoked(revokedORK) {
    this.revokedORK = revokedORK;
    return this;
  }

  /**
   * Sets the reovked ORK.
   *
   * @param {string} signedORK the armored key of the new ORK signed.
   * @returns {AccountRecoveryOrganizationPolicyEntityBuilder}
   */
  withNewORKSigned(signedORK) {
    this.signedORK = signedORK;
    return this;
  }

  /**
   * Sets the collection of private key passwords that have been rekeyed already.
   *
   * @param {AccountRecoveryPrivateKeyPasswordsCollection|null} rekeyedPrivateKeyPasswordCollection
   * @returns {AccountRecoveryOrganizationPolicyEntityBuilder}
   */
  withPrivateKeyPasswordCollection(rekeyedPrivateKeyPasswordCollection) {
    this.rekeyedPrivateKeyPasswordCollection = rekeyedPrivateKeyPasswordCollection;
    return this;
  }

  /**
   * Builds an AccountRecoveryOrganizationPolicyEntity from the data set by the "with" methods.
   * If necessary, if processes the signing of the new ORK and the revocation of the current ORK.
   *
   * @returns {AccountRecoveryOrganizationPolicyEntity}
   */
  build() {
    const dto = this.newOrganizationPolicy.toDto({account_recovery_organization_public_key: true});
    const requiresSignedORK = this._requiresToSignNewORK();
    const requiresRevokedORK = this._requiresToRevokeCurrentORK();
    const requiresPrivateKeyPasswords = requiresSignedORK && requiresRevokedORK;

    if (requiresSignedORK) {
      if (!this.signedORK) {
        throw new Error("No signing key provided while it is required to sign the new ORK.");
      }
      dto.account_recovery_organization_public_key = {armored_key: this.signedORK};
    }

    if (requiresRevokedORK) {
      if (!this.revokedORK) {
        throw new Error("The ORK changed so it is required to provide the revoked version of the current ORK.");
      }
      dto.account_recovery_organization_revoked_key = {armored_key: this.revokedORK};
    }

    if (requiresPrivateKeyPasswords) {
      if (!this.rekeyedPrivateKeyPasswordCollection) {
        throw new Error("The ORK changed so it is required to process for a private key passwords collection rekeying, no colletion provided.");
      }
      if (this.rekeyedPrivateKeyPasswordCollection.length > 0) {
        dto.account_recovery_private_key_passwords = this.rekeyedPrivateKeyPasswordCollection.toDto();
      }
    }
    return new AccountRecoveryOrganizationPolicyEntity(dto);
  }

  /**
   * Returns true if the new ORK needs to be signed.
   * It needs to be signed if the new ORK is enabled and changed from the current one.
   *
   * @returns {bool}
   */
  _requiresToSignNewORK() {
    if (this.newOrganizationPolicy.isDisabled) {
      return false;
    }

    if (this.currentOrganizationPolicy.isDisabled) {
      return true;
    }

    const oldPolicyDisabled = this.currentOrganizationPolicy.isDisabled;
    const keyHasChanged = this.currentOrganizationPolicy.armoredKey !== this.newOrganizationPolicy.armoredKey;

    return oldPolicyDisabled || keyHasChanged;
  }

  /**
   * Returns true if the current ORK needs to be revoked.
   * It needs to be revoked if the new policy is disabled or if the ORK has changed from the current one.
   *
   * @returns {bool}
   */
  _requiresToRevokeCurrentORK() {
    if (this.currentOrganizationPolicy.isDisabled) {
      return false;
    }

    const newPolicyIsDisabled = this.newOrganizationPolicy.isDisabled;
    const keyHasChanged = this.newOrganizationPolicy.armoredKey !== this.currentOrganizationPolicy.armoredKey;

    return keyHasChanged || newPolicyIsDisabled;
  }
}

exports.AccountRecoveryOrganizationPolicyEntityBuilder = AccountRecoveryOrganizationPolicyEntityBuilder;
