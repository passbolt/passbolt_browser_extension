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
 * @since         3.5.0
 */
const {AccountRecoveryModel} = require("../../model/accountRecovery/accountRecoveryModel");
const {AccountRecoveryOrganizationPolicyEntity} = require("../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity");
const {PrivateGpgkeyEntity} = require("../../model/entity/gpgkey/privateGpgkeyEntity");
const PassphraseController = require("../../controller/passphrase/passphraseController");

/**
 * Controller related to the account recovery save settings
 */
class AccountRecoverySaveOrganizationSettingsController {
  /**
   * AccountRecoverySaveOrganizationSettingsController constructor
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
   * Request the save organization settings of the account recovery
   * @param accountRecoveryOrganizationPolicyDto The account recovery organization policy
   * @param oldAccountRecoveryOrganisationPolicyDto the current account recovery organization policy
   * @param privateKeyDto the current private ORK with its passphrase
   */
  async exec(accountRecoveryOrganizationPolicyDto, oldAccountRecoveryOrganisationPolicyDto, privateKeyDto) {
    try {
      const adminPassphrase = await PassphraseController.request(this.worker);
      const accountRecoveryOrganizationPolicyEntity = new AccountRecoveryOrganizationPolicyEntity(accountRecoveryOrganizationPolicyDto);
      const oldAccountRecoveryOrganizationPolicyEntity = oldAccountRecoveryOrganisationPolicyDto ? new AccountRecoveryOrganizationPolicyEntity(oldAccountRecoveryOrganisationPolicyDto) : null;
      const privateKeyEntity = privateKeyDto ? new PrivateGpgkeyEntity(privateKeyDto) : null;

      await this.accountRecoveryModel.saveOrganizationSettings(accountRecoveryOrganizationPolicyEntity, oldAccountRecoveryOrganizationPolicyEntity, privateKeyEntity, adminPassphrase);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }
}


exports.AccountRecoverySaveOrganizationSettingsController = AccountRecoverySaveOrganizationSettingsController;
