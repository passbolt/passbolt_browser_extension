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
const {AccountRecoveryOrganizationPolicyEntityBuilder} = require('../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntityBuilder');
const {AccountRecoveryPrivateKeyPasswordsCollection} = require("../../model/entity/accountRecovery/accountRecoveryPrivateKeyPasswordsCollection");
const {DecryptPrivateKeyService} = require('../../service/crypto/decryptPrivateKeyService');
const {ReEncryptMessageService} = require("../../service/crypto/reEncryptMessageService");
const {SignGpgKeyService} = require('../../service/crypto/signGpgKeyService');
const {RevokeGpgKeyService} = require('../../service/crypto/revokeGpgKeyService');
const {ExternalGpgKeyEntity} = require('../../model/entity/gpgkey/external/externalGpgKeyEntity');
const {ExternalGpgKeyCollection} = require('../../model/entity/gpgkey/external/externalGpgKeyCollection');

class SaveAccountRecoveryOrganizationSettingsScenario {
  constructor(progressService, accountRecoveryModel) {
    this.progressService = progressService;
    this.accountRecoveryModel = accountRecoveryModel;
  }

  /**
   * Run the scenario to Save a new account recovery organization settings.
   *
   * @param {AccountRecoveryOrganizationPolicyEntity} newOrganizationPolicy The new account recovery organization policy.
   * @param {AccountRecoveryOrganizationPolicyEntity} currentOrganizationPolicy The current account recovery organization policy.
   * @param {PrivateGpgkeyEntity} userPrivateKey The user private key.
   * @param {PrivateGpgkeyEntity|null} organizationPrivateKey The current account recovery organization private key.
   */
  async run(newOrganizationPolicy, currentOrganizationPolicy, userPrivateKey, organizationPrivateKey) {
    const signingKeys = new ExternalGpgKeyCollection([]);
    const hasToRevokeCurrentOrganizationKey = this._hasToRevokedCurrentORK(newOrganizationPolicy, currentOrganizationPolicy);
    const hasToSignNewOrganizationKey = this._hasToSignNewORK(newOrganizationPolicy, currentOrganizationPolicy);
    const hasToReKeyPrivateKeyPasswords = hasToRevokeCurrentOrganizationKey && hasToSignNewOrganizationKey;
    const entityBuilder = new AccountRecoveryOrganizationPolicyEntityBuilder(newOrganizationPolicy, currentOrganizationPolicy);

    if (hasToRevokeCurrentOrganizationKey) {
      const decryptedOrganizationPrivateKey = (await DecryptPrivateKeyService.decryptPrivateGpgKeyEntity(organizationPrivateKey)).armoredKey;
      entityBuilder.withCurrentORKRevoked(await this._revokeCurrentORK(decryptedOrganizationPrivateKey));

      signingKeys.push(decryptedOrganizationPrivateKey);

      if (hasToReKeyPrivateKeyPasswords) {
        const privateKeyPasswordCollection = await this._reEncryptPrivateKeyPasswords(newOrganizationPolicy.armoredKey, decryptedOrganizationPrivateKey);
        entityBuilder.withPrivateKeyPasswordCollection(privateKeyPasswordCollection);
      }
    }

    if (hasToSignNewOrganizationKey) {
      const decryptedAdministratorKey = await (DecryptPrivateKeyService.decryptPrivateGpgKeyEntity(userPrivateKey));
      signingKeys.push(decryptedAdministratorKey.armoredKey);

      const signedNewORK = await this._signNewORK(newOrganizationPolicy.armoredKey, signingKeys);
      entityBuilder.withNewORKSigned(signedNewORK);
    }

    return this.accountRecoveryModel.saveOrganizationPolicy(await entityBuilder.build());
  }

  /**
   * Returns true if the current ORK needs to be revoked.
   * It is the case when the ORK is changed or if the new policy is set to "disabled".
   *
   * @param {AccountRecoveryOrganizationPolicyEntity} newPolicyEntity
   * @param {AccountRecoveryOrganizationPolicyEntity} currentPolicyEntity
   * @returns {bool}
   */
  _hasToRevokedCurrentORK(newPolicyEntity, currentPolicyEntity) {
    if (currentPolicyEntity.isDisabled) {
      return false;
    }

    const newPolicyIsDisabled = newPolicyEntity.isDisabled;
    const keyHasChanged = newPolicyEntity.armoredKey !== currentPolicyEntity.armoredKey;

    return keyHasChanged || newPolicyIsDisabled;
  }

  /**
   * Returns true if the new ORK needs to be signed.
   * It needs to be signed if the new ORK is enabled and changed from the current one.
   *
   * @param {AccountRecoveryOrganizationPolicyEntity} newPolicyEntity
   * @param {AccountRecoveryOrganizationPolicyEntity} currentPolicyEntity
   * @returns {bool}
   */
  _hasToSignNewORK(newPolicyEntity, currentPolicyEntity) {
    if (newPolicyEntity.isDisabled) {
      return false;
    }

    if (currentPolicyEntity.isDisabled) {
      return true;
    }

    const oldPolicyDisabled = currentPolicyEntity.isDisabled;
    const keyHasChanged = currentPolicyEntity.armoredKey !== newPolicyEntity.armoredKey;

    return oldPolicyDisabled || keyHasChanged;
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
      return new AccountRecoveryPrivateKeyPasswordsCollection();
    }

    await this.progressService.start(accountRecoveryPrivateKeyPasswords.length, i18n.t("Updating users' key..."));

    const newAccountRecoveryPrivateKeyPasswords = [];
    const items = accountRecoveryPrivateKeyPasswords.items;
    for (let i = 0; i < items.length; i++) {
      const encryptedKeyData = await ReEncryptMessageService.reEncrypt(items[i].data, encryptionKey, decryptionKey, decryptionKey);
      const privateKeyPasswordDto = {
        ...items[i].toDto(),
        data: encryptedKeyData.data
      };
      newAccountRecoveryPrivateKeyPasswords.push(privateKeyPasswordDto);
      await this.progressService.finishStep();
    }

    await this.progressService.close();
    return new AccountRecoveryPrivateKeyPasswordsCollection(newAccountRecoveryPrivateKeyPasswords);
  }

  /**
   * Do sign the given key with the given signing keys.
   *
   * @param {string} newOrkArmoredKey
   * @param {Array<string>} signingKeys
   * @returns {Promise<string>}
   */
  async _signNewORK(newOrkArmoredKey, signingKeys) {
    const keyToSign = new ExternalGpgKeyEntity({armored_key: newOrkArmoredKey});
    return (await SignGpgKeyService.sign(keyToSign, signingKeys)).armoredKey;
  }

  /**
   * Do revoke the given key.
   *
   * @param {string} currentORKArmoredKey
   * @returns {Promise<string>}
   */
  async _revokeCurrentORK(currentORKArmoredKey) {
    const keyToRevoke = new ExternalGpgKeyEntity({armored_key: currentORKArmoredKey});
    return (await RevokeGpgKeyService.revoke(keyToRevoke)).armoredKey;
  }
}

exports.SaveAccountRecoveryOrganizationSettingsScenario = SaveAccountRecoveryOrganizationSettingsScenario;
