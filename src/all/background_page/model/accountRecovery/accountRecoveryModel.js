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
const {AccountRecoveryOrganisationPolicyService} = require("../../service/api/accountRecovery/accountRecoveryOrganisationPolicyService");
const {AccountRecoveryOrganisationPolicyEntity} = require("../entity/accountRecovery/accountRecoveryOrganisationPolicyEntity");

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
    this.accountRecoveryOrganisationPolicyService = new AccountRecoveryOrganisationPolicyService(apiClientOptions);
  }

  /**
   * Save organisation settings of a accountRecovery using Passbolt API
   *
   * @param {AccountRecoveryOrganisationPolicyEntity} accountRecoveryOrganisationPolicyEntity
   */
  async saveOrganisationSettings(accountRecoveryOrganisationPolicyEntity) {
    const accountRecoveryOrganisationPolicyDto = await this.accountRecoveryOrganisationPolicyService.saveOrganisationSettings(accountRecoveryOrganisationPolicyEntity.toDto());
    return new AccountRecoveryOrganisationPolicyEntity(accountRecoveryOrganisationPolicyDto);
  }
}

exports.AccountRecoveryModel = AccountRecoveryModel;
