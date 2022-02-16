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
    const accountRecoveryModel = new AccountRecoveryModel(apiClientOptions);
    const progressService = new ProgressService(this.worker, i18n.t("Rekeying users' key"));
    this.saveAccountRecoveryOrganizationSettingsScenario = new SaveAccountRecoveryOrganizationSettingsScenario(progressService, accountRecoveryModel);
  }

  /**
   * Request the save organization settings of the account recovery
   * @param newAccountRecoveryOrganizationPolicyDto The new account recovery organization policy settings
   * @param currentAccountRecoveryOrganisationPolicyDto the current account recovery organization policy settings
   * @param privateKeyDto the current private ORK with its passphrase
   */
  async exec(newAccountRecoveryOrganizationPolicyDto, currentAccountRecoveryOrganisationPolicyDto, privateKeyDto) {
    try {
      const administratorPassphrase = await PassphraseController.request(this.worker);
      const newAccountRecoveryOrganizationPolicyEntity = new AccountRecoveryOrganizationPolicyEntity(newAccountRecoveryOrganizationPolicyDto);
      const currentAccountRecoveryOrganizationPolicyEntity = new AccountRecoveryOrganizationPolicyEntity(currentAccountRecoveryOrganisationPolicyDto);
      const administratorPrivateKeyEntity = new PrivateGpgkeyEntity({
        armored_key: (new Keyring()).findPrivate().armoredKey,
        passphrase: administratorPassphrase
      });
      const privateORKEntity = privateKeyDto ? new PrivateGpgkeyEntity(privateKeyDto) : null;

      await this.saveAccountRecoveryOrganizationSettingsScenario
        .run(newAccountRecoveryOrganizationPolicyEntity, currentAccountRecoveryOrganizationPolicyEntity, administratorPrivateKeyEntity, privateORKEntity);

      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }
}

exports.AccountRecoverySaveOrganizationSettingsController = AccountRecoverySaveOrganizationSettingsController;
