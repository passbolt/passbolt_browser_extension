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
const {AccountRecoveryOrganizationPolicyService} = require("../../service/api/accountRecovery/accountRecoveryOrganizationPolicyService");
const {AccountRecoveryOrganizationPolicyEntity} = require("../entity/accountRecovery/accountRecoveryOrganizationPolicyEntity");
const {PrivateGpgkeyEntity} = require("../entity/gpgkey/privateGpgkeyEntity");
const {ExternalGpgKeyEntity} = require("../entity/gpgkey/external/externalGpgKeyEntity");
const {ExternalGpgKeyCollection} = require("../entity/gpgkey/external/externalGpgKeyCollection");
const {SignGpgKeyService} = require("../../service/crypto/signGpgKeyService");
const {RevokeGpgKeyService} = require("../../service/crypto/revokeGpgKeyService");
const {Keyring} = require("../../model/keyring");
const {DecryptPrivateKeyService} = require('../../service/crypto/decryptPrivateKeyService');
const {AccountRecoveryRequestsCollection} = require("../entity/accountRecovery/accountRecoveryRequestsCollection");
const {AccountRecoveryRequestService} = require("../../service/api/accountRecovery/accountRecoveryRequestService");
/**
 * Model related to the account recovery
 */
class AccountRecoveryModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.accountRecoveryOrganizationPolicyService = new AccountRecoveryOrganizationPolicyService(apiClientOptions);
    this.accountRecoveryRequestService = new AccountRecoveryRequestService(apiClientOptions);
  }

  /**
   * Get an organization settings of an accountRecovery using Passbolt API
   *
   * @return {AccountRecoveryOrganizationPolicyEntity}
   */
  async find() {
    const accountRecoveryOrganizationPolicyDto = await this.accountRecoveryOrganizationPolicyService.find();
    return new AccountRecoveryOrganizationPolicyEntity(accountRecoveryOrganizationPolicyDto);
  }

  /**
   * Get user requests of an accountRecovery using Passbolt API
   *
   * @return {AccountRecoveryRequestsCollection}
   */
  async findUserRequests(userId) {
    const accountRecoveryRequestsCollectionDto = await this.accountRecoveryRequestService.findByUser(userId);
    return new AccountRecoveryRequestsCollection(accountRecoveryRequestsCollectionDto);
  }

  /**
   * Save organization settings of an accountRecovery using Passbolt API
   *
   * @param {AccountRecoveryOrganizationPolicyEntity} accountRecoveryOrganizationPolicyEntity
   * @param {AccountRecoveryOrganizationPolicyEntity} oldAccountRecoveryOrganizationPolicyEntity
   * @param {PrivateGpgkeyEntity} oldORKprivateKeyEntity
   * @param {string} adminPassphrase
   */
  async saveOrganizationSettings(accountRecoveryOrganizationPolicyEntity, oldAccountRecoveryOrganizationPolicyEntity, oldORKprivateKeyEntity, adminPassphrase) {
    const hasToSignKey = this.hasToSignTheNewKey(accountRecoveryOrganizationPolicyEntity, oldAccountRecoveryOrganizationPolicyEntity);
    const hasToRevokeOldKey = this.hasToRevokeTheFormerKey(accountRecoveryOrganizationPolicyEntity, oldAccountRecoveryOrganizationPolicyEntity);

    const contains = {
      account_recovery_organization_public_key: accountRecoveryOrganizationPolicyEntity.isEnabled,
      account_recovery_organization_revoked_key: hasToRevokeOldKey
    };

    const accountRecoveryOrganizationPolicyDto = accountRecoveryOrganizationPolicyEntity.toDto();

    const decryptedOldORK = oldORKprivateKeyEntity
      ? await DecryptPrivateKeyService.decryptPrivateGpgKeyEntity(oldORKprivateKeyEntity)
      : null;

    if (hasToSignKey) {
      const keyring = new Keyring();
      const decryptedAdminPrivateKey = await DecryptPrivateKeyService.decryptPrivateGpgKeyEntity(new PrivateGpgkeyEntity({
        armored_key: keyring.findPrivate().key,
        passphrase: adminPassphrase
      }));

      const keyToSign = new ExternalGpgKeyEntity({armored_key: accountRecoveryOrganizationPolicyEntity.armoredKey});
      const signingKeys = new ExternalGpgKeyCollection([
        {armored_key: decryptedAdminPrivateKey.armoredKey}
      ]);

      if (decryptedOldORK) {
        signingKeys.push(new ExternalGpgKeyEntity({armored_key: decryptedOldORK.armoredKey}));
      }

      const signedNewOrk = await SignGpgKeyService.sign(keyToSign, signingKeys);
      accountRecoveryOrganizationPolicyDto.account_recovery_organization_public_key = accountRecoveryOrganizationPolicyDto.account_recovery_organization_public_key || {};
      accountRecoveryOrganizationPolicyDto.account_recovery_organization_public_key.armored_key = signedNewOrk.armoredKey;
    }

    if (hasToRevokeOldKey) {
      const revokedKey = await RevokeGpgKeyService.revoke(decryptedOldORK);
      accountRecoveryOrganizationPolicyDto.account_recovery_organization_revoked_key = accountRecoveryOrganizationPolicyDto.account_recovery_organization_revoked_key || {};
      accountRecoveryOrganizationPolicyDto.account_recovery_organization_revoked_key.armored_key = revokedKey.armoredKey;
    }

    const newAccountRecoveryPolicy = new AccountRecoveryOrganizationPolicyEntity(accountRecoveryOrganizationPolicyDto);
    const saveAccountRecoveryOrganizationPolicyDto = await this.accountRecoveryOrganizationPolicyService.saveOrganizationSettings(newAccountRecoveryPolicy.toDto(contains));
    return new AccountRecoveryOrganizationPolicyEntity(saveAccountRecoveryOrganizationPolicyDto);
  }

  /**
   * Returns true if the new provided ORK must be signed.
   * It has to be signed if the policy is "enabled" and if the key is a new one.
   *
   * @param {AccountRecoveryOrganizationPolicyEntity} newAccountRecoveryOrganizationPolicyEntity
   * @param {AccountRecoveryOrganizationPolicyEntity} oldAccountRecoveryOrganizationPolicyEntity
   */
  hasToSignTheNewKey(newAccountRecoveryOrganizationPolicyEntity, oldAccountRecoveryOrganizationPolicyEntity) {
    const newPolicyEnabled = newAccountRecoveryOrganizationPolicyEntity.isEnabled;
    const oldPolicyDisabled = oldAccountRecoveryOrganizationPolicyEntity.isDisabled;
    const keyHasChanged = oldAccountRecoveryOrganizationPolicyEntity.armoredKey !== newAccountRecoveryOrganizationPolicyEntity.armoredKey;

    return newPolicyEnabled && (oldPolicyDisabled || keyHasChanged);
  }

  /**
   * Returns true if the old ORK must be revoked.
   * It has to be revoked if the key changed and that the old ORK wasn't disabled.
   *
   * @param {AccountRecoveryOrganizationPolicyEntity} newAccountRecoveryOrganizationPolicyEntity
   * @param {AccountRecoveryOrganizationPolicyEntity} oldAccountRecoveryOrganizationPolicyEntity
   */
  hasToRevokeTheFormerKey(newAccountRecoveryOrganizationPolicyEntity, oldAccountRecoveryOrganizationPolicyEntity) {
    const newPolicyIsDisabled = newAccountRecoveryOrganizationPolicyEntity.isDisabled;
    const oldPolicyIsEnabled = oldAccountRecoveryOrganizationPolicyEntity.isEnabled;
    const keyHasChanged = newAccountRecoveryOrganizationPolicyEntity.armoredKey !== oldAccountRecoveryOrganizationPolicyEntity.armoredKey;

    return oldPolicyIsEnabled && (keyHasChanged || newPolicyIsDisabled);
  }
}

exports.AccountRecoveryModel = AccountRecoveryModel;
