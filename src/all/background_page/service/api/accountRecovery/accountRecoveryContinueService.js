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

const ACCOUNT_RECOVERY_CONTINUE_SERVICE_RESOURCE_NAME = '/account-recovery/continue';

class AccountRecoveryContinueService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, AccountRecoveryContinueService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return ACCOUNT_RECOVERY_CONTINUE_SERVICE_RESOURCE_NAME;
  }

  /**
   * Check if the user can continue its account recovery
   * @param {string} userId The user id who continues the account recovery
   * @param {string} authenticationTokenToken The authentication token
   * @returns {Promise<void>}
   */
  async continue(userId, authenticationTokenToken) {
    this.assertValidId(userId);
    this.assertValidId(authenticationTokenToken);
    await this.apiClient.get(`${userId}/${authenticationTokenToken}`);
  }
}

export default AccountRecoveryContinueService;
