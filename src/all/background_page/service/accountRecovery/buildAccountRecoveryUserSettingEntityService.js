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

const secrets = require("secrets.js-grempe");
const {EncryptMessageService} = require("../crypto/encryptMessageService");
const {AccountRecoveryPrivateKeyEntity} = require("../../model/entity/accountRecovery/accountRecoveryPrivateKeyEntity");
const {AccountRecoveryUserSettingEntity} = require("../../model/entity/accountRecovery/accountRecoveryUserSettingEntity");
const {AccountRecoveryPrivateKeyPasswordEntity} = require("../../model/entity/accountRecovery/accountRecoveryPrivateKeyPasswordEntity");
const {AccountRecoveryPrivateKeyPasswordsCollection} = require("../../model/entity/accountRecovery/accountRecoveryPrivateKeyPasswordsCollection");
const {AccountRecoveryOrganizationPublicKeyEntity} = require("../../model/entity/accountRecovery/accountRecoveryOrganizationPublicKeyEntity");

// Length of the secret to use to encrypt symmetrically the user private key with.
const SYMMETRIC_SECRET_LENGTH = 512;

class BuildAccountRecoveryUserSettingEntityService {
  /**
   * Factory to build AccountRecoveryUserSettingEntity.
   *
   * @param {Object} accountRecoveryUserSettingDto The user account recovery setting DTO.
   * @param {Object} accountRecoveryOrganisationPublicKey The organization account recovery public key. Optional if the user rejected the account recovery program.
   * @param {string} decryptedArmoredUserPrivateKey The user decrypted armored user private key. Optional if the user rejected the account recovery program.
   * @returns {Promise<AccountRecoveryUserSettingEntity>}
   */
  static async build(accountRecoveryUserSettingDto, accountRecoveryOrganisationPublicKey, decryptedArmoredUserPrivateKey) {
    const accountRecoveryUserSetting = new AccountRecoveryUserSettingEntity(accountRecoveryUserSettingDto);

    if (!accountRecoveryUserSetting.isApproved) {
      return accountRecoveryUserSetting;
    }

    if (!accountRecoveryOrganisationPublicKey || !(accountRecoveryOrganisationPublicKey instanceof AccountRecoveryOrganizationPublicKeyEntity)) {
      throw new Error("The parameter 'accountRecoveryOrganisationPublicKey' should be a valid AccountRecoveryOrganizationPublicKeyEntity.");
    }
    if (!decryptedArmoredUserPrivateKey || typeof decryptedArmoredUserPrivateKey !== 'string') {
      throw new Error("The parameter 'decryptedArmoredPrivateKey' should be a string.");
    }

    await this._encryptUserPrivateKeyForAccountRecovery(accountRecoveryUserSetting, accountRecoveryOrganisationPublicKey, decryptedArmoredUserPrivateKey);

    return accountRecoveryUserSetting;
  }

  /**
   * Encrypt the user private key for account recovery.
   * - Generate a secret of 512 bits
   * - Encrypt symmetrically the user private key with the generated secret and sign it with the user private key
   * - Encrypt the generated secret with the organization account recovery public key and sign it with the user private key
   *
   * @param {AccountRecoveryUserSettingEntity} accountRecoveryUserSetting The user account recovery setting. The variable will be updated with the encrypted data.
   * @param {AccountRecoveryOrganizationPublicKeyEntity} accountRecoveryOrganizationPublicKey The organization account recovery public key. Optional if the user rejected the account recovery program.
   * @param {string} decryptedArmoredPrivateKey The user decrypted armored private key.
   * @returns {Promise<void>}
   * @private
   */
  static async _encryptUserPrivateKeyForAccountRecovery(accountRecoveryUserSetting, accountRecoveryOrganizationPublicKey, decryptedArmoredPrivateKey) {
    // Encrypt decrypted private key with AES256.
    const symmetricSecret = secrets.random(SYMMETRIC_SECRET_LENGTH);
    const userPrivateKeySymmetricEncrypted = await EncryptMessageService.encryptSymmetrically(decryptedArmoredPrivateKey, [symmetricSecret], decryptedArmoredPrivateKey);
    const accountRecoveryPrivateKeyDto = {data: userPrivateKeySymmetricEncrypted.data};
    accountRecoveryUserSetting.accountRecoveryPrivateKey = new AccountRecoveryPrivateKeyEntity(accountRecoveryPrivateKeyDto);

    // Encrypt AES256 secret with organization recovery public key.
    const userPrivateKeySecretEncrypted = await EncryptMessageService.encrypt(symmetricSecret, accountRecoveryOrganizationPublicKey.armoredKey, decryptedArmoredPrivateKey);
    const accountRecoveryPrivateKeyPasswordDto = {
      data: userPrivateKeySecretEncrypted.data,
      recipient_foreign_model: AccountRecoveryPrivateKeyPasswordEntity.FOREIGN_MODEL_ORGANIZATION_KEY
    };
    const accountRecoveryPrivateKeyPasswordsEntity = new AccountRecoveryPrivateKeyPasswordEntity(accountRecoveryPrivateKeyPasswordDto);
    accountRecoveryUserSetting.accountRecoveryPrivateKeyPasswords = new AccountRecoveryPrivateKeyPasswordsCollection([accountRecoveryPrivateKeyPasswordsEntity]);
  }
}

exports.BuildAccountRecoveryUserSettingEntityService = BuildAccountRecoveryUserSettingEntityService;
