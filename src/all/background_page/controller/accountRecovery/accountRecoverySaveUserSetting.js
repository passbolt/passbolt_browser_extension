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
const {AccountRecoveryModel} = require("../../model/accountRecovery/accountRecoveryModel");
const {AccountRecoveryUserSettingEntity} = require("../../model/entity/accountRecovery/accountRecoveryUserSettingEntity");
const {AccountRecoveryOrganizationPublicKeyEntity} = require("../../model/entity/accountRecovery/accountRecoveryOrganizationPublicKeyEntity");
const PassphraseController = require("../../controller/passphrase/passphraseController");

/**
 * Controller related to the account recovery save settings
 */
class AccountRecoverySaveUserSettingController {
  /**
   * AccountRecoverySaveUserSettingController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.accountRecoveryModel = new AccountRecoveryModel(apiClientOptions);
  }

  /**
   * Saves the user account recovery setting.
   * @param accountRecoveryUserSettingDto The account recovery use setting dto
   * @param accountRecoveryOrganizationPolicyDto The account recovery organization policy dto
   */
  async exec(accountRecoveryUserSettingDto, accountRecoveryOrganizationPolicyDto) {
    try {
      const accountRecoveryUserSettingEntity = new AccountRecoveryUserSettingEntity(accountRecoveryUserSettingDto);
      const userPassphrase = accountRecoveryUserSettingEntity.isApproved
        ? await PassphraseController.request(this.worker)
        : null;

      const accountRecoveryOrganizationPublicKeyEntity = accountRecoveryUserSettingEntity.isApproved
        ? new AccountRecoveryOrganizationPublicKeyEntity(accountRecoveryOrganizationPolicyDto)
        : null;

      await this.accountRecoveryModel.saveUserSetting(accountRecoveryUserSettingEntity, userPassphrase, accountRecoveryOrganizationPublicKeyEntity);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }
}


exports.AccountRecoverySaveUserSettingController = AccountRecoverySaveUserSettingController;
