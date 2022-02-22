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
const {AccountRecoveryModel} = require("../../model/accountRecovery/accountRecoveryModel");
const {AccountRecoveryOrganizationPolicyEntity} = require("../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity");
const {PrivateGpgkeyEntity} = require("../../model/entity/gpgkey/privateGpgkeyEntity");
const PassphraseController = require("../../controller/passphrase/passphraseController");
const {ProgressService} = require("../../service/progress/progressService");
const {Keyring} = require("../../model/keyring");
const {SaveAccountRecoveryOrganizationSettingsScenario} = require('../../scenarios/accountRecovery/saveAccountRecoveryOrganizationSettingsScenario');

/**
 * Controller related to the account recovery save settings
 */
class AccountRecoverySaveOrganizationPolicyController {
  /**
   * AccountRecoverySaveOrganizationSettingsController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    const accountRecoveryModel = new AccountRecoveryModel(apiClientOptions);
    this.accountRecoveryModel = accountRecoveryModel;
    const progressService = new ProgressService(this.worker, i18n.t("Rekeying users' key"));
    this.saveAccountRecoveryOrganizationSettingsScenario = new SaveAccountRecoveryOrganizationSettingsScenario(progressService, accountRecoveryModel);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @param {Object} organizationPolicyDto The account recovery organization policy
   * @param {Object} organizationPrivateKeyDto The current account recovery organization private key with its passphrase.
   * @return {Promise<void>}
   */
  async _exec(organizationPolicyDto, organizationPrivateKeyDto = null) {
    try {
      const organizationPolicy = await this.exec(organizationPolicyDto, organizationPrivateKeyDto);
      this.worker.port.emit(this.requestId, "SUCCESS", organizationPolicy);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Save the account recovery organization policy.
   *
   * @param {Object} organizationPolicyDto The account recovery organization policy
   * @param {Object} organizationPrivateKeyDto The current account recovery organization private key with its passphrase.
   * @return {Promise<AccountRecoveryOrganizationPolicyEntity>}
   */
  async exec(organizationPolicyDto, organizationPrivateKeyDto = null) {
    const newOrganizationPolicy = new AccountRecoveryOrganizationPolicyEntity(organizationPolicyDto);
    const organizationPrivateKey = organizationPrivateKeyDto ? new PrivateGpgkeyEntity(organizationPrivateKeyDto) : null;

    const userPassphrase = await PassphraseController.request(this.worker);
    const userPrivateKey = new PrivateGpgkeyEntity({
      armored_key: (new Keyring()).findPrivate().armoredKey,
      passphrase: userPassphrase
    });

    const currentOrganizationPolicy = await this.accountRecoveryModel.findOrganizationPolicy();

    return this.saveAccountRecoveryOrganizationSettingsScenario
      .run(newOrganizationPolicy, currentOrganizationPolicy, userPrivateKey, organizationPrivateKey);
  }
}

exports.AccountRecoverySaveOrganizationPolicyController = AccountRecoverySaveOrganizationPolicyController;
