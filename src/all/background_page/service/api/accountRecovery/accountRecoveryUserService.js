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
const {AbstractService} = require('../abstract/abstractService');

const ACCOUNT_RECOVERY_SERVICE_RESOURCE_NAME = '/account-recovery/users/settings/';

class AccountRecoveryUserService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, AccountRecoveryUserService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return ACCOUNT_RECOVERY_SERVICE_RESOURCE_NAME;
  }

  /**
   * Save user account recovery settings using Passbolt API
   *
   * @param {AccountRecoveryUserSettingDto} accountRecoveryUserSettingDto
   * @returns {Promise<*>} Response body
   * @throw {TypeError} if user account recovery setting dto is null
   * @public
   */
  async saveUserSetting(accountRecoveryUserSettingDto) {
    // @todo @debug @mock for account-recovery
    this.assertNonEmptyData(accountRecoveryUserSettingDto);
    return accountRecoveryUserSettingDto;
    /*
     * const response = await this.apiClient.create(accountRecoveryUserSettingDto);
     * return response.body;
     */
  }
}

exports.AccountRecoveryUserService = AccountRecoveryUserService;
