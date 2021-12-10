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
 * @since         3.4.0
 */
const {AccountRecoveryModel} = require("../../model/accountRecovery/accountRecoveryModel");
const {AccountRecoveryOrganisationPolicyEntity} = require("../../model/entity/accountRecovery/accountRecoveryOrganisationPolicyEntity");

/**
 * Controller related to the account recovery save settings
 */
class AccountRecoverySaveOrganisationSettingsController {
  /**
   * AccountRecoverySaveOrganisationSettingsController constructor
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
   * Request the save organisation settings of the account recovery
   * @param accountRecoveryOrganisationPolicyDto The account recovery organisation policy
   */
  async exec(accountRecoveryOrganisationPolicyDto) {
    try {
      const accountRecoveryOrganisationPolicyEntity = new AccountRecoveryOrganisationPolicyEntity(accountRecoveryOrganisationPolicyDto);
      const newAccountRecoveryOrganisationPolicyEntity = await this.accountRecoveryModel.saveOrganisationSettings(accountRecoveryOrganisationPolicyEntity);
      this.worker.port.emit(this.requestId, "SUCCESS", newAccountRecoveryOrganisationPolicyEntity);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }
}


exports.AccountRecoverySaveOrganisationSettingsController = AccountRecoverySaveOrganisationSettingsController;
