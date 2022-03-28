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
const {i18n} = require('../../sdk/i18n');
const {AccountRecoveryModel} = require("../../model/accountRecovery/accountRecoveryModel");
const {AccountRecoveryOrganizationPolicyEntity} = require("../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity");
const {AccountRecoveryOrganizationPolicyChangeEntity} = require("../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyChangeEntity");
const {PrivateGpgkeyEntity} = require("../../model/entity/gpgkey/privateGpgkeyEntity");
const {AccountRecoveryPrivateKeyPasswordsCollection} = require("../../model/entity/accountRecovery/accountRecoveryPrivateKeyPasswordsCollection");
const {Keyring} = require("../../model/keyring");
const {ProgressService} = require("../../service/progress/progressService");
const {DecryptPrivateKeyService} = require('../../service/crypto/decryptPrivateKeyService');
const {ReEncryptMessageService} = require("../../service/crypto/reEncryptMessageService");
const {SignGpgKeyService} = require('../../service/crypto/signGpgKeyService');
const {RevokeGpgKeyService} = require('../../service/crypto/revokeGpgKeyService');
const PassphraseController = require("../../controller/passphrase/passphraseController");
const {GetGpgKeyInfoService} = require("../../service/crypto/getGpgKeyInfoService");

/**
 * Controller related to the account recovery save settings
 */
class AccountRecoverySaveOrganizationPolicyController {
  /**
   * AccountRecoverySaveOrganizationSettingsController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.accountRecoveryModel = new AccountRecoveryModel(apiClientOptions);
    this.progressService = new ProgressService(this.worker, i18n.t("Rekeying users' key"));
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @param {Object} organizationPolicyChangesDto The account recovery organization policy changes
   * @param {Object} organizationPrivateKeyDto The current account recovery organization private key with its passphrase.
   * @return {Promise<void>}
   */
  async _exec(organizationPolicyChangesDto, organizationPrivateKeyDto = null) {
    try {
      const organizationPolicy = await this.exec(organizationPolicyChangesDto, organizationPrivateKeyDto);
      this.worker.port.emit(this.requestId, "SUCCESS", organizationPolicy);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Save the account recovery organization policy.
   *
   * @param {Object} organizationPolicyChangesDto The account recovery organization policy changes
   * @param {Object} organizationPrivateKeyDto The current account recovery organization private key with its passphrase.
   * @return {Promise<AccountRecoveryOrganizationPolicyEntity>}
   */
  async exec(organizationPolicyChangesDto, organizationPrivateKeyDto = null) {
    const userPassphrase = await PassphraseController.request(this.worker);
    const organizationPolicyChanges = new AccountRecoveryOrganizationPolicyChangeEntity(organizationPolicyChangesDto);
    const organizationPrivateKey = organizationPrivateKeyDto ? new PrivateGpgkeyEntity(organizationPrivateKeyDto) : null;

    const currentOrganizationPolicy = await this.accountRecoveryModel.findOrganizationPolicy();

    const hasNewOrganizationKey = Boolean(organizationPolicyChanges.accountRecoveryOrganizationPublicKey);
    const hasToRevokeCurrentOrganizationKey = this._hasToRevokedCurrentORK(organizationPolicyChanges, currentOrganizationPolicy);
    const hasToSignNewOrganizationKey = this._hasToSignNewORK(organizationPolicyChanges, currentOrganizationPolicy);
    const hasToReKeyPrivateKeyPasswords = hasToRevokeCurrentOrganizationKey && hasToSignNewOrganizationKey;

    const saveOrganizationPolicyDto = organizationPolicyChanges.toDto({account_recovery_organization_public_key: true});
    saveOrganizationPolicyDto.policy = saveOrganizationPolicyDto.policy || currentOrganizationPolicy.policy;

    if (hasNewOrganizationKey) {
      const newOrganizationPublicKeyInfo = await GetGpgKeyInfoService.getKeyInfo(organizationPolicyChanges.armoredKey);
      saveOrganizationPolicyDto.account_recovery_organization_public_key.fingerprint = newOrganizationPublicKeyInfo.fingerprint;
    } else {
      saveOrganizationPolicyDto.public_key_id = currentOrganizationPolicy.publicKeyId;
    }

    const signingKeys = [];
    if (hasToRevokeCurrentOrganizationKey) {
      const decryptedOrganizationPrivateKey = await DecryptPrivateKeyService.decryptPrivateGpgKeyEntity(organizationPrivateKey);
      const organizationPrivateKeyInfo = await GetGpgKeyInfoService.getKeyInfo(decryptedOrganizationPrivateKey);
      saveOrganizationPolicyDto.account_recovery_organization_revoked_key = {
        armored_key: await RevokeGpgKeyService.revoke(decryptedOrganizationPrivateKey),
        fingerprint: organizationPrivateKeyInfo.fingerprint
      };

      signingKeys.push(decryptedOrganizationPrivateKey);

      if (hasToReKeyPrivateKeyPasswords) {
        const privateKeyPasswordCollection = await this._reEncryptPrivateKeyPasswords(organizationPolicyChanges.armoredKey, decryptedOrganizationPrivateKey);
        saveOrganizationPolicyDto.account_recovery_private_key_passwords = privateKeyPasswordCollection.toDto();
      }
    }

    if (hasToSignNewOrganizationKey) {
      const usersPrivateKey = (new Keyring()).findPrivate().armoredKey;
      const decryptedAdministratorKey = await DecryptPrivateKeyService.decrypt(usersPrivateKey, userPassphrase);
      signingKeys.push(decryptedAdministratorKey);

      const signedNewORK = await SignGpgKeyService.sign(organizationPolicyChanges.armoredKey, signingKeys);
      saveOrganizationPolicyDto.account_recovery_organization_public_key.armored_key = signedNewORK.armor();
    }

    const saveOrganizationPolicyEntity = new AccountRecoveryOrganizationPolicyEntity(saveOrganizationPolicyDto);

    return this.accountRecoveryModel.saveOrganizationPolicy(saveOrganizationPolicyEntity);
  }

  /**
   * Returns true if the current ORK needs to be revoked.
   * It is the case when the ORK is changed or if the new policy is set to "disabled".
   *
   * @param {AccountRecoveryOrganizationPolicyChangeEntity} policyChangesEntity The organization policy changes
   * @param {AccountRecoveryOrganizationPolicyEntity} currentPolicyEntity The current organization policy
   * @returns {bool}
   */
  _hasToRevokedCurrentORK(policyChangesEntity, currentPolicyEntity) {
    if (currentPolicyEntity.isDisabled) {
      return false;
    }

    if (policyChangesEntity.isDisabled) {
      return true;
    }

    return Boolean(policyChangesEntity.accountRecoveryOrganizationPublicKey)
      && currentPolicyEntity.armoredKey !== policyChangesEntity.armoredKey;
  }

  /**
   * Returns true if the new ORK needs to be signed.
   * It needs to be signed if the new ORK is enabled and changed from the current one.
   *
   * @param {AccountRecoveryOrganizationPolicyChangeEntity} policyChangesEntity The organization policy changes
   * @param {AccountRecoveryOrganizationPolicyEntity} currentPolicyEntity The current organization policy
   * @returns {bool}
   */
  _hasToSignNewORK(policyChangesEntity, currentPolicyEntity) {
    if (policyChangesEntity.isDisabled) {
      return false;
    }

    if (currentPolicyEntity.isDisabled) {
      return true;
    }

    return Boolean(policyChangesEntity.accountRecoveryOrganizationPublicKey)
      && currentPolicyEntity.armoredKey !== policyChangesEntity.armoredKey;
  }

  /**
   * Reencrypt the existing account recovery private key passwords with the new organization recovery key.
   *
   * @param {string} encryptionKey
   * @param {string} decryptionKey
   * @returns {Promise<AccountRecoveryPrivateKeyPasswordsCollection>}
   */
  async _reEncryptPrivateKeyPasswords(encryptionKey, decryptionKey) {
    const accountRecoveryPrivateKeyPasswords = await this.accountRecoveryModel.findAccountRecoveryPrivateKeyPasswords();
    if (accountRecoveryPrivateKeyPasswords.length === 0) {
      return new AccountRecoveryPrivateKeyPasswordsCollection([]);
    }

    await this.progressService.start(accountRecoveryPrivateKeyPasswords.length, i18n.t("Updating users' key..."));

    const newAccountRecoveryPrivateKeyPasswords = [];
    const items = accountRecoveryPrivateKeyPasswords.items;
    const encryptionKeyInfo = await GetGpgKeyInfoService.getKeyInfo(encryptionKey);
    for (let i = 0; i < items.length; i++) {
      const encryptedKeyData = await ReEncryptMessageService.reEncrypt(items[i].data, encryptionKey, decryptionKey, decryptionKey);
      const privateKeyPasswordDto = {
        ...items[i].toDto(),
        data: encryptedKeyData,
        recipient_fingerprint: encryptionKeyInfo.fingerprint,
      };
      newAccountRecoveryPrivateKeyPasswords.push(privateKeyPasswordDto);
      await this.progressService.finishStep();
    }

    this.progressService.close();
    return new AccountRecoveryPrivateKeyPasswordsCollection(newAccountRecoveryPrivateKeyPasswords);
  }
}

exports.AccountRecoverySaveOrganizationPolicyController = AccountRecoverySaveOrganizationPolicyController;
