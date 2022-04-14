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

const {AccountRecoveryUserSettingEntity} = require("../../model/entity/accountRecovery/accountRecoveryUserSettingEntity");
const {DecryptPrivateKeyService} = require("../../service/crypto/decryptPrivateKeyService");
const {BuildApprovedAccountRecoveryUserSettingEntityService} = require("../../service/accountRecovery/buildApprovedAccountRecoveryUserSettingEntityService");

class SetSetupAccountRecoveryUserSettingController {
  /**
   * Constructor
   * @param {Worker} worker The associated worker.
   * @param {string} requestId The associated request id.
   * @param {AccountSetupEntity} account The account being setup.
   * @param {Object} runtimeMemory The setup runtime memory.
   */
  constructor(worker, requestId, account, runtimeMemory) {
    this.worker = worker;
    this.requestId = requestId;
    this.account = account;
    this.runtimeMemory = runtimeMemory;
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @param {string} status The account recovery user settings status (approved or rejected).
   * @param {string} passphrase The user passphrase, necessary to decrypt the user private key.
   * @return {Promise<void>}
   */
  async _exec(status, passphrase) {
    try {
      await this.exec(status, passphrase);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Set the account recovery user setting.
   *
   * @param {string} status The account recovery user settings status (approved or rejected).
   * @param {string} passphrase The user passphrase, necessary to decrypt the user private key.
   * @return {Promise<void>}
   */
  async exec(status, passphrase) {
    let accountRecoveryUserSettingEntity;
    const isApproved = status === AccountRecoveryUserSettingEntity.STATUS_APPROVED;

    if (isApproved) {
      accountRecoveryUserSettingEntity = await this.buildApprovedUserSetting(passphrase);
    } else {
      accountRecoveryUserSettingEntity = await this.buildRejectedUserSetting();
    }

    this.account.accountRecoveryUserSetting = accountRecoveryUserSettingEntity;
  }

  /**
   * Build the approved user setting entity.
   * @param {string} passphrase The user passphrase.
   * @returns {Promise<AccountRecoveryUserSettingEntity>}
   * @throw {TypeError} if the passphrase does not validate
   */
  async buildApprovedUserSetting(passphrase) {
    if (!passphrase || !Validator.isUtf8(passphrase)) {
      throw new TypeError('The passphrase should be a valid string.');
    }

    const userId = this.account.userId;
    const userPrivateArmoredKey = this.account.userPrivateArmoredKey;
    const userDecryptedPrivateOpenpgpKey = await DecryptPrivateKeyService.decrypt(userPrivateArmoredKey, passphrase);
    const organizationPolicy = this.runtimeMemory.accountRecoveryOrganizationPolicy;

    return BuildApprovedAccountRecoveryUserSettingEntityService.build(userId, userDecryptedPrivateOpenpgpKey, organizationPolicy);
  }

  /**
   * Build the rejected user setting entity.
   * @returns {Promise<AccountRecoveryUserSettingEntity>}
   */
  async buildRejectedUserSetting() {
    const userId = this.account.userId;
    const userSettingDto = {user_id: userId, status: AccountRecoveryUserSettingEntity.STATUS_REJECTED};

    return new AccountRecoveryUserSettingEntity(userSettingDto);
  }
}

exports.SetSetupAccountRecoveryUserSettingController = SetSetupAccountRecoveryUserSettingController;
