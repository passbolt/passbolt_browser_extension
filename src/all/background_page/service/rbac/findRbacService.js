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
 * @since         5.8.0
 */
import RbacsCollection from "passbolt-styleguide/src/shared/models/entity/rbac/rbacsCollection";
import RbacApiService from "passbolt-styleguide/src/shared/services/api/rbac/rbacApiService";

/**
 * The service aims to find roles from the API.
 */
export default class FindRbacService {
  /**
   * @constructor
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.rbacApiService = new RbacApiService(apiClientOptions);
  }

  /**
   * Find all rbacs relative to the current signed in user.
   * @returns {Promise<RbacsCollection>}
   */
  async findMe() {
    const response = await this.rbacApiService.findMe({ui_action: true, action: true});
    return new RbacsCollection(response.body, {clone: false});
  }
}
