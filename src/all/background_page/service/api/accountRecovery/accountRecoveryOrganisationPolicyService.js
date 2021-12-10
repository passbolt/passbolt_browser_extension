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
const {AbstractService} = require('../abstract/abstractService');

const ACCOUNT_RECOVERY_ORGANISATION_POLICY_SERVICE_RESOURCE_NAME = '/account-recovery/organization-policies';

class AccountRecoveryOrganisationPolicyService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, AccountRecoveryOrganisationPolicyService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return ACCOUNT_RECOVERY_ORGANISATION_POLICY_SERVICE_RESOURCE_NAME;
  }

  /**
   * Save organisation settings of a accountRecovery using Passbolt API
   *
   * @param {Object} accountRecoveryOrganisationPolicyDto
   * @returns {Promise<*>} Response body
   * @throw {TypeError} if account recovery organisation policy dto is null
   * @public
   */
  async saveOrganisationSettings(accountRecoveryOrganisationPolicyDto) {
    this.assertNonEmptyData(accountRecoveryOrganisationPolicyDto);
    return accountRecoveryOrganisationPolicyDto;
    /*
     * const response = await this.apiClient.create(accountRecoveryOrganisationPolicyDto);
     * return response.body;
     */
  }
}

exports.AccountRecoveryOrganisationPolicyService = AccountRecoveryOrganisationPolicyService;
