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
import AccountTemporarySessionStorageService from "../../service/sessionStorage/accountTemporarySessionStorageService";
import FindAccountTemporaryService from "../../service/account/findAccountTemporaryService";

class SetSetupAccountRecoveryUserSettingController {
  /**
   * Constructor
   * @param {Worker} worker The associated worker.
   * @param {string} requestId The associated request id.
   */
  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
    this.temporaryAccount = null;
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
    this.temporaryAccount = await FindAccountTemporaryService.exec(this.worker.port._port.name);
    let accountRecoveryUserSettingEntity;
    const isApproved = status === AccountRecoveryUserSettingEntity.STATUS_APPROVED;

    if (isApproved) {
      accountRecoveryUserSettingEntity = await this.buildApprovedUserSetting();
    } else {
      accountRecoveryUserSettingEntity = await this.buildRejectedUserSetting();
    }

    this.temporaryAccount.account.accountRecoveryUserSetting = accountRecoveryUserSettingEntity;
    // Update all data in the temporary account stored
    await AccountTemporarySessionStorageService.set(this.temporaryAccount);
  }

  /**
   * Build the approved user setting entity.
   * @returns {Promise<AccountRecoveryUserSettingEntity>}
   * @throw {TypeError} if no passphrase defined in the setup runtime memory.
   */
  async buildApprovedUserSetting() {
    if (!this.temporaryAccount?.passphrase) {
      throw new Error('A passphrase is required.');
    }

    const userPrivateKey = await OpenpgpAssertion.readKeyOrFail(this.temporaryAccount.account.userPrivateArmoredKey);
    const userDecryptedPrivateKey = await DecryptPrivateKeyService.decrypt(userPrivateKey, this.temporaryAccount.passphrase);
    const organizationPolicy = this.temporaryAccount.accountRecoveryOrganizationPolicy;

    return BuildApprovedAccountRecoveryUserSettingEntityService.build(this.temporaryAccount.account, userDecryptedPrivateKey, organizationPolicy);
  }

  /**
   * Build the rejected user setting entity.
   * @returns {Promise<AccountRecoveryUserSettingEntity>}
   */
  async buildRejectedUserSetting() {
    const userId = this.temporaryAccount.account.userId;
    const userSettingDto = {user_id: userId, status: AccountRecoveryUserSettingEntity.STATUS_REJECTED};

    return new AccountRecoveryUserSettingEntity(userSettingDto);
  }
}

export default SetSetupAccountRecoveryUserSettingController;
