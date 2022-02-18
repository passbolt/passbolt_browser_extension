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

class SetupSetAccountRecoveryUserSettingController {
  /**
   * Controller constructor
   * @param {Worker} worker The associated worker.
   * @param {string} requestId The associated request id.
   * @param {SetupEntity} setupEntity The associated setup entity.
   */
  constructor(worker, requestId, setupEntity) {
    this.worker = worker;
    this.requestId = requestId;
    this.setupEntity = setupEntity;
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
   * Set the account recovery user setting.
   *
   * @param {Object} accountRecoveryUserSettingDto The account recovery user settings dto
   * @return {Promise<void>}
   */
  async exec(accountRecoveryUserSettingDto) {
    let accountRecoveryUserSettingEntity;
    const isApproved = accountRecoveryUserSettingDto.status === AccountRecoveryUserSettingEntity.STATUS_APPROVED;

    if (isApproved) {
      accountRecoveryUserSettingEntity = await this.buildApprovedUserSetting();
    } else {
      const userId = this.setupEntity.userId;
      const userSettingDto = {user_id: userId, status: AccountRecoveryUserSettingEntity.STATUS_REJECTED};
      accountRecoveryUserSettingEntity = new AccountRecoveryUserSettingEntity(userSettingDto);
    }

    this.setupEntity.accountRecoveryUserSetting = accountRecoveryUserSettingEntity;
  }

  /**
   * Build the approved user setting entity.
   * @returns {Promise<AccountRecoveryUserSettingEntity>}
   */
  async buildApprovedUserSetting() {
    const userId = this.setupEntity.userId;
    const userPassphrase = this.setupEntity.passphrase;
    const userPrivateArmoredKey = this.setupEntity.userPrivateArmoredKey;
    const userDecryptedPrivateOpenpgpKey = await DecryptPrivateKeyService.decrypt(userPrivateArmoredKey, userPassphrase);
    const organizationPolicy = await this.setupEntity.accountRecoveryOrganizationPolicy;

    return BuildApprovedAccountRecoveryUserSettingEntityService.build(userId, userDecryptedPrivateOpenpgpKey, organizationPolicy);
  }
}

exports.SetupSetAccountRecoveryUserSettingController = SetupSetAccountRecoveryUserSettingController;
