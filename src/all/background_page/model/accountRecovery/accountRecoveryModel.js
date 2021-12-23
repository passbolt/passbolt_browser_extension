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
const {AccountRecoveryOrganizationPolicyService} = require("../../service/api/accountRecovery/accountRecoveryOrganizationPolicyService");
const {AccountRecoveryOrganizationPolicyEntity} = require("../entity/accountRecovery/accountRecoveryOrganizationPolicyEntity");

/**
 * Model related to the account recovery
 */
class AccountRecoveryModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.accountRecoveryOrganizationPolicyService = new AccountRecoveryOrganizationPolicyService(apiClientOptions);
  }

  /**
   * Get an organization settings of an accountRecovery using Passbolt API
   *
   * @return {AccountRecoveryOrganizationPolicyEntity}
   */
  async find() {
    const accountRecoveryOrganizationPolicyDto = await this.accountRecoveryOrganizationPolicyService.find();
    return new AccountRecoveryOrganizationPolicyEntity(accountRecoveryOrganizationPolicyDto);
  }

  /**
   * Save organization settings of an accountRecovery using Passbolt API
   *
   * @param {AccountRecoveryOrganizationPolicyEntity} accountRecoveryOrganizationPolicyEntity
   */
  async saveOrganisationSettings(accountRecoveryOrganizationPolicyEntity) {
    const accountRecoveryOrganizationPolicyDto = await this.accountRecoveryOrganizationPolicyService.saveOrganisationSettings(accountRecoveryOrganizationPolicyEntity.toDto());
    return new AccountRecoveryOrganizationPolicyEntity(accountRecoveryOrganizationPolicyDto);
  }
}

exports.AccountRecoveryModel = AccountRecoveryModel;
