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

const {User} = require("../../model/user");
const {Keyring} = require("../../model/keyring");
const {AccountRecoveryModel} = require("../../model/accountRecovery/accountRecoveryModel");
const {AccountRecoveryUserSettingEntity} = require("../../model/entity/accountRecovery/accountRecoveryUserSettingEntity");
const PassphraseController = require("../../controller/passphrase/passphraseController");
const {DecryptPrivateKeyService} = require("../../service/crypto/decryptPrivateKeyService");
const {BuildApprovedAccountRecoveryUserSettingEntityService} = require("../../service/accountRecovery/buildApprovedAccountRecoveryUserSettingEntityService");
const {readKeyOrFail} = require("../../utils/openpgp/openpgpAssertions");
/**
 * Controller related to the account recovery save settings
 */
class AccountRecoverySaveUserSettingsController {
  /**
   * AccountRecoverySaveUserSettingsController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions
   * @param {AbstractAccountEntity} account The account associated to the worker.
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.keyring = new Keyring();
    this.account = account;
    this.accountRecoveryModel = new AccountRecoveryModel(apiClientOptions);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @param {Object} accountRecoveryUserSettingDto The account recovery user settings dto
   * @return {Promise<void>}
   */
  async _exec(accountRecoveryUserSettingDto) {
    try {
      await this.exec(accountRecoveryUserSettingDto);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Saves the account recovery user settings.
   * @param {Object} accountRecoveryUserSettingDto The account recovery user settings dto
   * @return {Promise<AccountRecoveryUserSettingEntity>}
   */
  async exec(accountRecoveryUserSettingDto) {
    let accountRecoveryUserSettingEntity;
    const isApproved = accountRecoveryUserSettingDto.status === AccountRecoveryUserSettingEntity.STATUS_APPROVED;

    if (isApproved) {
      accountRecoveryUserSettingEntity = await this.buildApprovedUserSetting();
    } else {
      const userId = User.getInstance().get().id;
      const userSettingDto = {user_id: userId, status: AccountRecoveryUserSettingEntity.STATUS_REJECTED};
      accountRecoveryUserSettingEntity = new AccountRecoveryUserSettingEntity(userSettingDto);
    }

    return this.accountRecoveryModel.saveUserSetting(accountRecoveryUserSettingEntity);
  }

  /**
   * Build the approved user setting entity.
   * @returns {Promise<AccountRecoveryUserSettingEntity>}
   */
  async buildApprovedUserSetting() {
    const userPassphrase = await PassphraseController.get(this.worker);
    const userPrivateArmoredKey = this.keyring.findPrivate().armoredKey;
    const userPrivateKey = await readKeyOrFail(userPrivateArmoredKey);
    const userDecryptedPrivateKey = await DecryptPrivateKeyService.decrypt(userPrivateKey, userPassphrase);
    const organizationPolicy = await this.accountRecoveryModel.findOrganizationPolicy();
    if (!organizationPolicy) {
      throw new Error("Account recovery organization policy not found.");
    }

    return BuildApprovedAccountRecoveryUserSettingEntityService.build(this.account, userDecryptedPrivateKey, organizationPolicy);
  }
}

exports.AccountRecoverySaveUserSettingsController = AccountRecoverySaveUserSettingsController;
