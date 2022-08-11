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
import Keyring from "../../model/keyring";
import AccountRecoveryModel from "../../model/accountRecovery/accountRecoveryModel";
import DecryptPrivateKeyService from "../../service/crypto/decryptPrivateKeyService";
import {PassphraseController} from "../passphrase/passphraseController";
import User from "../../model/user";
import AccountRecoveryUserSettingEntity from "../../model/entity/accountRecovery/accountRecoveryUserSettingEntity";
import BuildApprovedAccountRecoveryUserSettingEntityService from "../../service/accountRecovery/buildApprovedAccountRecoveryUserSettingEntityService";


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
    const organizationPolicy = await this.accountRecoveryModel.findOrganizationPolicy();
    if (!organizationPolicy) {
      throw new Error("Account recovery organization policy not found.");
    }

    if (organizationPolicy.isDisabled) {
      throw new Error("The Account recovery organization policy should be enabled.");
    }

    let accountRecoveryUserSettingEntity;
    const isApproved = accountRecoveryUserSettingDto.status === AccountRecoveryUserSettingEntity.STATUS_APPROVED;
    if (isApproved) {
      accountRecoveryUserSettingEntity = await this.buildApprovedUserSetting(organizationPolicy);
    } else {
      const userId = User.getInstance().get().id;
      const userSettingDto = {user_id: userId, status: AccountRecoveryUserSettingEntity.STATUS_REJECTED};
      accountRecoveryUserSettingEntity = new AccountRecoveryUserSettingEntity(userSettingDto);
    }

    return this.accountRecoveryModel.saveUserSetting(accountRecoveryUserSettingEntity);
  }

  /**
   * Build the approved user setting entity.
   * @param {AccountRecoveryOrganizationPolicyEntity} organizationPolicy the current organization policy.
   * @returns {Promise<AccountRecoveryUserSettingEntity>}
   */
  async buildApprovedUserSetting(organizationPolicy) {
    const userPassphrase = await PassphraseController.request(this.worker);
    const userPrivateArmoredKey = this.keyring.findPrivate().armoredKey;
    const userPrivateKey = await OpenpgpAssertion.readKeyOrFail(userPrivateArmoredKey);
    const userDecryptedPrivateKey = await DecryptPrivateKeyService.decrypt(userPrivateKey, userPassphrase);

    return BuildApprovedAccountRecoveryUserSettingEntityService.build(this.account, userDecryptedPrivateKey, organizationPolicy);
  }
}

export default AccountRecoverySaveUserSettingsController;
