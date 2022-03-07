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

// Length of the secret to use to encrypt symmetrically the user private key with.
const SYMMETRIC_SECRET_LENGTH = 512;

class BuildApprovedAccountRecoveryUserSettingEntityService {
  /**
   * Build accepted account recovery user setting entity.
   *
   * @param {string} userId The target user identifier.
   * @param {openpgp.PrivateKey|string} decryptedPrivateOpenpgpKey The user decrypted private openpgp key.
   * @param {AccountRecoveryOrganizationPolicyEntity} organizationPolicy The organization policy.
   * @returns {Promise<AccountRecoveryUserSettingEntity>}
   */
  static async build(userId, decryptedPrivateOpenpgpKey, organizationPolicy) {
    decryptedPrivateOpenpgpKey = await assertDecryptedPrivateKeys(decryptedPrivateOpenpgpKey);

    if (!organizationPolicy || !(organizationPolicy instanceof AccountRecoveryOrganizationPolicyEntity)) {
      throw new Error("The provided organizationPolicy must be a valid AccountRecoveryOrganizationPolicyEntity.");
    }

    const symmetricSecret = secrets.random(SYMMETRIC_SECRET_LENGTH);
    const accountRecoveryPrivateKeyDto = await this._encryptPrivateKey(symmetricSecret, decryptedPrivateOpenpgpKey);
    const accountRecoveryPrivateKeyPasswordForOrganizationDto = await this._encryptPrivateKeyPasswordsForOrganizationKey(symmetricSecret, organizationPolicy, decryptedPrivateOpenpgpKey);

    const userSettingDto = {
      user_id: userId,
      status: AccountRecoveryUserSettingEntity.STATUS_APPROVED,
      account_recovery_private_key: accountRecoveryPrivateKeyDto,
      account_recovery_private_key_passwords: [accountRecoveryPrivateKeyPasswordForOrganizationDto]
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
   * @param {string} symmetricSecret The symmetric secret to use to encrypt the private key.
   * @param {AccountRecoveryOrganizationPolicyEntity} organizationPolicy The organization policy.
   * @param {openpgp.PrivateKey} decryptedPrivateOpenpgpKey The user decrypted private openpgp key.
   * @returns {Promise<Object>}
   */
  static async _encryptPrivateKeyPasswordsForOrganizationKey(symmetricSecret, organizationPolicy, decryptedPrivateOpenpgpKey) {
    const userPrivateKeySecretEncrypted = await EncryptMessageService.encrypt(symmetricSecret, organizationPolicy.armoredKey, decryptedPrivateOpenpgpKey);

    return {
      data: userPrivateKeySecretEncrypted,
      recipient_foreign_model: AccountRecoveryPrivateKeyPasswordEntity.FOREIGN_MODEL_ORGANIZATION_KEY
    };
  }
}

exports.BuildApprovedAccountRecoveryUserSettingEntityService = BuildApprovedAccountRecoveryUserSettingEntityService;
