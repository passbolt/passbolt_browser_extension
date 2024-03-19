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
import AbstractService from "../abstract/abstractService";

const ACCOUNT_RECOVERY_ORGANIZATION_POLICY_SERVICE_RESOURCE_NAME = '/account-recovery/organization-policies';

class AccountRecoveryOrganizationPolicyService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, AccountRecoveryOrganizationPolicyService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return ACCOUNT_RECOVERY_ORGANIZATION_POLICY_SERVICE_RESOURCE_NAME;
  }

  /**
   * Return the list of supported options for the contain option in API find operations
   *
   * @returns {Array<string>} list of supported option
   */
  static getSupportedContainOptions() {
    return [
      "creator",
      "creator.gpgkey",
    ];
  }

  /**
   * Find an organization settings of an accountRecovery
   *
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async find(contains) {
    const options = contains ? this.formatContainOptions(contains, AccountRecoveryOrganizationPolicyService.getSupportedContainOptions()) : null;
    const response = await this.apiClient.findAll(options);
    return response.body;
  }

  /**
   * Save organization settings of an accountRecovery using Passbolt API
   *
   * @param {Object} accountRecoveryOrganizationPolicyDto
   * @returns {Promise<*>} Response body
   * @throw {TypeError} if account recovery organization policy dto is null
   * @public
   */
  async saveOrganizationPolicy(accountRecoveryOrganizationPolicyDto) {
    this.assertNonEmptyData(accountRecoveryOrganizationPolicyDto);

    const response = await this.apiClient.create(accountRecoveryOrganizationPolicyDto);
    return response.body;
  }
}

export default AccountRecoveryOrganizationPolicyService;
