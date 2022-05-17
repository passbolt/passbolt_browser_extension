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
const {AccountRecoveryPrivateKeyPasswordEntity} = require("../../model/entity/accountRecovery/accountRecoveryPrivateKeyPasswordEntity");
const {AccountRecoveryOrganizationPolicyEntity} = require("../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity");
const {AccountRecoveryOrganizationPolicyChangeEntity} = require("../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyChangeEntity");
const {PrivateGpgkeyEntity} = require("../../model/entity/gpgkey/privateGpgkeyEntity");
const {AccountRecoveryPrivateKeyPasswordsCollection} = require("../../model/entity/accountRecovery/accountRecoveryPrivateKeyPasswordsCollection");
const {Keyring} = require("../../model/keyring");
const {ProgressService} = require("../../service/progress/progressService");
const {DecryptPrivateKeyService} = require('../../service/crypto/decryptPrivateKeyService');
const {SignGpgKeyService} = require('../../service/crypto/signGpgKeyService');
const {RevokeGpgKeyService} = require('../../service/crypto/revokeGpgKeyService');
const PassphraseController = require("../../controller/passphrase/passphraseController");
const {DecryptPrivateKeyPasswordDataService} = require("../../service/accountRecovery/decryptPrivateKeyPasswordDataService");
const {EncryptMessageService} = require("../../service/crypto/encryptMessageService");
const {readKeyOrFail} = require('../../utils/openpgp/openpgpAssertions');

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
    this.keyring = new Keyring();
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
    const userPassphrase = await PassphraseController.get(this.worker);
    const organizationPolicyChanges = new AccountRecoveryOrganizationPolicyChangeEntity(organizationPolicyChangesDto);
    const organizationPrivateKeyEntity = organizationPrivateKeyDto ? new PrivateGpgkeyEntity(organizationPrivateKeyDto) : null;
    const currentOrganizationPolicy = await this.accountRecoveryModel.findOrganizationPolicy();

    const hasNewOrganizationKey = Boolean(organizationPolicyChanges.accountRecoveryOrganizationPublicKey);
    const hasToRevokeCurrentOrganizationKey = this._hasToRevokedCurrentORK(organizationPolicyChanges, currentOrganizationPolicy);

    const newOrganizationPublicKey = hasNewOrganizationKey ? await readKeyOrFail(organizationPolicyChanges.accountRecoveryOrganizationPublicKey.armoredKey) : null;
    const saveOrganizationPolicyDto = organizationPolicyChanges.toDto({account_recovery_organization_public_key: true});
    saveOrganizationPolicyDto.policy = saveOrganizationPolicyDto.policy || currentOrganizationPolicy.policy;

    const signedInUserPrivateArmoredKey = this.keyring.findPrivate().armoredKey;
    const signedInUserPrivateKey = await readKeyOrFail(signedInUserPrivateArmoredKey);
    const signedInUserDecryptedPrivateKey = await DecryptPrivateKeyService.decrypt(signedInUserPrivateKey, userPassphrase);

    if (hasNewOrganizationKey) {
      const signedNewORK = await SignGpgKeyService.sign(newOrganizationPublicKey, [signedInUserDecryptedPrivateKey]);
      saveOrganizationPolicyDto.account_recovery_organization_public_key.fingerprint = newOrganizationPublicKey.getFingerprint().toUpperCase();
      saveOrganizationPolicyDto.account_recovery_organization_public_key.armored_key = signedNewORK.armor();
    } else {
      saveOrganizationPolicyDto.public_key_id = currentOrganizationPolicy.publicKeyId;
    }

    if (hasToRevokeCurrentOrganizationKey) {
      const organizationPrivateKey = await readKeyOrFail(organizationPrivateKeyEntity.armoredKey);
      const decryptedOrganizationPrivateKey = await DecryptPrivateKeyService.decrypt(organizationPrivateKey, organizationPrivateKeyEntity.passphrase);
      const revokedPublicKey = await RevokeGpgKeyService.revoke(decryptedOrganizationPrivateKey);
      saveOrganizationPolicyDto.account_recovery_organization_revoked_key = {
        armored_key: revokedPublicKey.armor(),
        fingerprint: decryptedOrganizationPrivateKey.getFingerprint().toUpperCase()
      };

      if (hasNewOrganizationKey) {
        const privateKeyPasswordCollection = await this._reEncryptPrivateKeyPasswords(
          newOrganizationPublicKey,
          decryptedOrganizationPrivateKey,
          signedInUserDecryptedPrivateKey,
        );
        const signedNewORK = await SignGpgKeyService.sign(newOrganizationPublicKey, [decryptedOrganizationPrivateKey]);
        saveOrganizationPolicyDto.account_recovery_organization_public_key.armored_key = signedNewORK.armor();
        saveOrganizationPolicyDto.account_recovery_private_key_passwords = privateKeyPasswordCollection.toDto();
      }
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
   * Re-encrypt the existing account recovery private key passwords with the new organization recovery key.
   *
   * @param {openpgp.PublicKey} encryptionKey The new organization public key to use to encrypt the private key password data.
   * @param {openpgp.PrivateKey} decryptionKey The previous organization decrypted private key to use to decrypt the private key password data.
   * @param {openpgp.PrivateKey} signedInUserDecryptedPrivateKey The decrypted private key of the current signed in user.
   * @returns {Promise<AccountRecoveryPrivateKeyPasswordsCollection>}
   */
  async _reEncryptPrivateKeyPasswords(encryptionKey, decryptionKey, signedInUserDecryptedPrivateKey) {
    const accountRecoveryPrivateKeyPasswords = await this.accountRecoveryModel.findAccountRecoveryPrivateKeyPasswords();
    if (accountRecoveryPrivateKeyPasswords.length === 0) {
      return new AccountRecoveryPrivateKeyPasswordsCollection([]);
    }

    await this.progressService.start(accountRecoveryPrivateKeyPasswords.length, i18n.t("Updating users' key..."));

    const reEncryptedPrivateKeyPasswords = [];
    for (const privateKeyPassword of accountRecoveryPrivateKeyPasswords) {
      const newPrivateKeyPasswordDto = await this._reEncryptPrivateKeyPassword(privateKeyPassword, encryptionKey, decryptionKey, signedInUserDecryptedPrivateKey);
      reEncryptedPrivateKeyPasswords.push(newPrivateKeyPasswordDto);
      await this.progressService.finishStep();
    }

    this.progressService.close();
    return new AccountRecoveryPrivateKeyPasswordsCollection(reEncryptedPrivateKeyPasswords);
  }

  /**
   * Re-encrypt a private key password.
   * @param {AccountRecoveryPrivateKeyPasswordEntity} privateKeyPassword The private key password to re-encrypt.
   * @param {openpgp.PublicKey} encryptionKey The new organization public key to use to encrypt the private key password data.
   * @param {openpgp.PrivateKey} decryptionKey The previous organization decrypted private key to use to decrypt the private key password data.
   * @param {openpgp.PrivateKey} signedInUserDecryptedPrivateKey The signed-in user decrypted private key to use to sign the private key password data.
   * @returns {Promise<AccountRecoveryPrivateKeyPasswordEntity>}
   * @private
   */
  async _reEncryptPrivateKeyPassword(privateKeyPassword, encryptionKey, decryptionKey, signedInUserDecryptedPrivateKey) {
    const privateKeyPasswordDecryptedData = await DecryptPrivateKeyPasswordDataService.decrypt(privateKeyPassword, decryptionKey);
    const privateKeyPasswordDecryptedDataSerialized = JSON.stringify(privateKeyPasswordDecryptedData);
    const encryptedKeyData = await EncryptMessageService.encrypt(privateKeyPasswordDecryptedDataSerialized, encryptionKey, [decryptionKey, signedInUserDecryptedPrivateKey]);

    return new AccountRecoveryPrivateKeyPasswordEntity({
      data: encryptedKeyData,
      private_key_id: privateKeyPassword.privateKeyId,
      recipient_fingerprint: encryptionKey.getFingerprint().toUpperCase(),
      recipient_foreign_model: AccountRecoveryPrivateKeyPasswordEntity.FOREIGN_MODEL_ORGANIZATION_KEY,
    });
  }
}

exports.AccountRecoverySaveOrganizationPolicyController = AccountRecoverySaveOrganizationPolicyController;
