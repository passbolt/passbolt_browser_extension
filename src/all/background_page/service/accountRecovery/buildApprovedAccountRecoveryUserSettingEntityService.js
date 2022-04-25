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

const secrets = require("secrets.js-grempe");
const {EncryptMessageService} = require("../crypto/encryptMessageService");
const {AccountRecoveryUserSettingEntity} = require("../../model/entity/accountRecovery/accountRecoveryUserSettingEntity");
const {AccountRecoveryPrivateKeyPasswordEntity} = require("../../model/entity/accountRecovery/accountRecoveryPrivateKeyPasswordEntity");
const {AccountRecoveryOrganizationPolicyEntity} = require("../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity");
const {assertDecryptedPrivateKeys} = require("../../utils/openpgp/openpgpAssertions");
const {GetGpgKeyInfoService} = require("../crypto/getGpgKeyInfoService");
const {AccountRecoveryPrivateKeyPasswordDecryptedDataEntity} = require("../../model/entity/accountRecovery/accountRecoveryPrivateKeyPasswordDecryptedDataEntity");

// The strength of the secret to use to encrypt the private key.
const SYMMETRIC_SECRET_BITS = 512;

class BuildApprovedAccountRecoveryUserSettingEntityService {
  /**
   * Build accepted account recovery user setting entity.
   *
   * @param {AbstractAccountEntity} account The account creating the account recovery user setting.
   * @param {openpgp.PrivateKey|string} decryptedPrivateOpenpgpKey The user decrypted private openpgp key.
   * @param {AccountRecoveryOrganizationPolicyEntity} organizationPolicy The organization policy.
   * @returns {Promise<AccountRecoveryUserSettingEntity>}
   */
  static async build(account, decryptedPrivateOpenpgpKey, organizationPolicy) {
    decryptedPrivateOpenpgpKey = await assertDecryptedPrivateKeys(decryptedPrivateOpenpgpKey);

    if (!organizationPolicy || !(organizationPolicy instanceof AccountRecoveryOrganizationPolicyEntity)) {
      throw new Error("The provided organizationPolicy must be a valid AccountRecoveryOrganizationPolicyEntity.");
    }

    const symmetricSecret = secrets.random(SYMMETRIC_SECRET_BITS);
    const accountRecoveryPrivateKeyDto = await this._encryptPrivateKey(symmetricSecret, decryptedPrivateOpenpgpKey);
    const accountRecoveryPrivateKeyPasswordForOrganizationDto = await this._encryptPrivateKeyPasswordsForOrganizationKey(account, symmetricSecret, organizationPolicy, decryptedPrivateOpenpgpKey);

    accountRecoveryPrivateKeyDto.account_recovery_private_key_passwords = [accountRecoveryPrivateKeyPasswordForOrganizationDto];

    const userSettingDto = {
      user_id: account.userId,
      status: AccountRecoveryUserSettingEntity.STATUS_APPROVED,
      account_recovery_private_key: accountRecoveryPrivateKeyDto
    };

    return new AccountRecoveryUserSettingEntity(userSettingDto);
  }

  /**
   * Encrypt the user private key symmetrically.
   *
   * @param {string} symmetricSecret The symmetric secret to use to encrypt the private key.
   * @param {openpgp.PrivateKey} decryptedPrivateOpenpgpKey The user decrypted private openpgp key.
   * @returns {Promise<Object>}
   */
  static async _encryptPrivateKey(symmetricSecret, decryptedPrivateOpenpgpKey) {
    const decryptedPrivateArmoredKey = decryptedPrivateOpenpgpKey.armor();
    const userPrivateKeySymmetricEncrypted = await EncryptMessageService.encryptSymmetrically(decryptedPrivateArmoredKey, [symmetricSecret], decryptedPrivateArmoredKey);

    return {data: userPrivateKeySymmetricEncrypted};
  }

  /**
   * Encrypt the user private key passwords for the account recovery contacts defined in the organization policy.
   *
   * @param {AbstractAccountEntity} account The account creating the account recovery user setting.
   * @param {string} symmetricSecret The symmetric secret to use to encrypt the private key.
   * @param {AccountRecoveryOrganizationPolicyEntity} organizationPolicy The organization policy.
   * @param {openpgp.PrivateKey} decryptedPrivateOpenpgpKey The user decrypted private openpgp key.
   * @returns {Promise<Object>}
   * @private
   */
  static async _encryptPrivateKeyPasswordsForOrganizationKey(account, symmetricSecret, organizationPolicy, decryptedPrivateOpenpgpKey) {
    const organizationPublicKey = organizationPolicy.armoredKey;
    const organizationPublicKeyInfo = await GetGpgKeyInfoService.getKeyInfo(organizationPublicKey);
    const privateKeyPasswordDecryptedData = this._buildPrivateKeyPasswordDecryptedData(account, symmetricSecret);
    const serializedPrivateKeyPasswordDecryptedData = JSON.stringify(privateKeyPasswordDecryptedData.toDto());
    const privateKeyPasswordEncryptedData = await EncryptMessageService.encrypt(serializedPrivateKeyPasswordDecryptedData, organizationPublicKey, decryptedPrivateOpenpgpKey);

    return {
      data: privateKeyPasswordEncryptedData,
      recipient_foreign_model: AccountRecoveryPrivateKeyPasswordEntity.FOREIGN_MODEL_ORGANIZATION_KEY,
      recipient_fingerprint: organizationPublicKeyInfo.fingerprint,
    };
  }

  /**
   * Encrypt the user private key passwords for the account recovery contacts defined in the organization policy.
   *
   * @param {AbstractAccountEntity} account The account creating the account recovery user setting.
   * @param {string} symmetricSecret The symmetric secret used to encrypt the private key with.
   * @returns {AccountRecoveryPrivateKeyPasswordDecryptedDataEntity}
   * @private
   */
  static _buildPrivateKeyPasswordDecryptedData(account, symmetricSecret) {
    const privateLeyPasswordDecryptedDataDto = {
      domain: account.domain,
      type: "account-recovery-private-key-password-decrypted-data",
      version: "v1",
      private_key_user_id: account.userId,
      private_key_fingerprint: account.userKeyFingerprint,
      private_key_secret: symmetricSecret,
      created: (new Date()).toISOString()
    };

    return new AccountRecoveryPrivateKeyPasswordDecryptedDataEntity(privateLeyPasswordDecryptedDataDto);
  }
}

exports.BuildApprovedAccountRecoveryUserSettingEntityService = BuildApprovedAccountRecoveryUserSettingEntityService;
