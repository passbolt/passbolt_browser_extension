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

const ACCOUNT_RECOVERY_PRIVATE_KEY_PASSWORD_RESOURCE_NAME = '/account-recovery/private-key-passwords';

class AccountRecoveryPrivateKeyPasswordService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, AccountRecoveryPrivateKeyPasswordService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return ACCOUNT_RECOVERY_PRIVATE_KEY_PASSWORD_RESOURCE_NAME;
  }

  /**
   * Find all user's account recovery private key password.
   *
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async findAll() {
    const response = await this.apiClient.findAll();
    return response.body;
  }
}

export default  AccountRecoveryPrivateKeyPasswordService;
