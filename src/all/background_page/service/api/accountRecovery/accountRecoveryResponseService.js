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

const ACCOUNT_RECOVERY_RESPONSE_SERVICE_RESOURCE_NAME = '/account-recovery/responses';

class AccountRecoveryResponseService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, AccountRecoveryResponseService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return ACCOUNT_RECOVERY_RESPONSE_SERVICE_RESOURCE_NAME;
  }

  /**
   * Save review account recovery request
   * @param accountRecoveryResponseDto
   * @returns {Promise<*>}
   */
  async saveReview(accountRecoveryResponseDto) {
    const response = await this.apiClient.create(accountRecoveryResponseDto);
    return response.body;
  }
}

export default AccountRecoveryResponseService;
