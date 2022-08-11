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
import DecryptPrivateKeyService from "../../service/crypto/decryptPrivateKeyService";
import AccountRecoveryUserSettingEntity from "../../model/entity/accountRecovery/accountRecoveryUserSettingEntity";
import BuildApprovedAccountRecoveryUserSettingEntityService from "../../service/accountRecovery/buildApprovedAccountRecoveryUserSettingEntityService";

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
   * @return {Promise<void>}
   */
  async _exec() {
    try {
      await this.exec.apply(this, arguments);
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
   * @return {Promise<void>}
   */
  async exec(status) {
    let accountRecoveryUserSettingEntity;
    const isApproved = status === AccountRecoveryUserSettingEntity.STATUS_APPROVED;

    if (isApproved) {
      accountRecoveryUserSettingEntity = await this.buildApprovedUserSetting();
    } else {
      accountRecoveryUserSettingEntity = await this.buildRejectedUserSetting();
    }

    this.account.accountRecoveryUserSetting = accountRecoveryUserSettingEntity;
  }

  /**
   * Build the approved user setting entity.
   * @returns {Promise<AccountRecoveryUserSettingEntity>}
   * @throw {TypeError} if no passphrase defined in the setup runtime memory.
   */
  async buildApprovedUserSetting() {
    if (!this?.runtimeMemory?.passphrase) {
      throw new Error('A passphrase is required.');
    }

    const userPrivateKey = await OpenpgpAssertion.readKeyOrFail(this.account.userPrivateArmoredKey);
    const userDecryptedPrivateKey = await DecryptPrivateKeyService.decrypt(userPrivateKey, this.runtimeMemory.passphrase);
    const organizationPolicy = this.runtimeMemory.accountRecoveryOrganizationPolicy;

    return BuildApprovedAccountRecoveryUserSettingEntityService.build(this.account, userDecryptedPrivateKey, organizationPolicy);
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

export default SetSetupAccountRecoveryUserSettingController;
