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

import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import EncryptMessageService from "../crypto/encryptMessageService";
import AccountRecoveryOrganizationPolicyEntity from "../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity";
import secrets from 'secrets-passbolt';
import AccountRecoveryPrivateKeyPasswordEntity from "../../model/entity/accountRecovery/accountRecoveryPrivateKeyPasswordEntity";
import AccountRecoveryPrivateKeyPasswordDecryptedDataEntity from "../../model/entity/accountRecovery/accountRecoveryPrivateKeyPasswordDecryptedDataEntity";
import AccountRecoveryUserSettingEntity from "../../model/entity/accountRecovery/accountRecoveryUserSettingEntity";

// The strength of the secret to use to encrypt the private key.
const SYMMETRIC_SECRET_BITS = 512;

class BuildApprovedAccountRecoveryUserSettingEntityService {
  /**
   * Build accepted account recovery user setting entity.
   *
   * @param {AbstractAccountEntity} account The account creating the account recovery user setting.
   * @param {openpgp.PrivateKey} decryptedPrivateKey The user decrypted private key.
   * @param {AccountRecoveryOrganizationPolicyEntity} organizationPolicy The organization policy.
   * @returns {Promise<AccountRecoveryUserSettingEntity>}
   */
  static async build(account, decryptedPrivateKey, organizationPolicy) {
    OpenpgpAssertion.assertDecryptedPrivateKey(decryptedPrivateKey);

    if (!organizationPolicy || !(organizationPolicy instanceof AccountRecoveryOrganizationPolicyEntity)) {
      throw new Error("The provided organizationPolicy must be a valid AccountRecoveryOrganizationPolicyEntity.");
    }

    const symmetricSecret = secrets.random(SYMMETRIC_SECRET_BITS);
    const accountRecoveryPrivateKeyDto = await this._encryptPrivateKey(symmetricSecret, decryptedPrivateKey);
    const accountRecoveryPrivateKeyPasswordForOrganizationDto = await this._encryptPrivateKeyPasswordsForOrganizationKey(account, symmetricSecret, organizationPolicy, decryptedPrivateKey);

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
   * @param {openpgp.PrivateKey} decryptedPrivateKey The user decrypted private key.
   * @returns {Promise<Object>}
   */
  static async _encryptPrivateKey(symmetricSecret, decryptedPrivateKey) {
    const userPrivateKeySymmetricEncrypted = await EncryptMessageService.encryptSymmetrically(decryptedPrivateKey.armor(), [symmetricSecret], [decryptedPrivateKey]);
    return {data: userPrivateKeySymmetricEncrypted};
  }

  /**
   * Encrypt the user private key passwords for the account recovery contacts defined in the organization policy.
   *
   * @param {AbstractAccountEntity} account The account creating the account recovery user setting.
   * @param {string} symmetricSecret The symmetric secret to use to encrypt the private key.
   * @param {AccountRecoveryOrganizationPolicyEntity} organizationPolicy The organization policy.
   * @param {openpgp.PrivateKey} decryptedPrivateKey The user decrypted private key.
   * @returns {Promise<Object>}
   * @private
   */
  static async _encryptPrivateKeyPasswordsForOrganizationKey(account, symmetricSecret, organizationPolicy, decryptedPrivateKey) {
    const organizationPublicKey = await OpenpgpAssertion.readKeyOrFail(organizationPolicy.armoredKey);
    const privateKeyPasswordDecryptedData = this._buildPrivateKeyPasswordDecryptedData(account, symmetricSecret);
    const serializedPrivateKeyPasswordDecryptedData = JSON.stringify(privateKeyPasswordDecryptedData.toDto());
    const privateKeyPasswordEncryptedData = await EncryptMessageService.encrypt(serializedPrivateKeyPasswordDecryptedData, organizationPublicKey, [decryptedPrivateKey]);

    return {
      data: privateKeyPasswordEncryptedData,
      recipient_foreign_model: AccountRecoveryPrivateKeyPasswordEntity.FOREIGN_MODEL_ORGANIZATION_KEY,
      recipient_fingerprint: organizationPublicKey.getFingerprint().toUpperCase(),
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

export default BuildApprovedAccountRecoveryUserSettingEntityService;
