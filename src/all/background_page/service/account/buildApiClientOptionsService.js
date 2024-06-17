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
import {ApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions";

class BuildApiClientOptionsService {
  /**
   * Build Api client options based on an account.
   * @param {AbstractAccountEntity} account The account to build the api client options based on
   * @returns {ApiClientOptions}
   */
  static buildFromAccount(account) {
    return this.buildFromDomain(account.domain);
  }

  /**
   * Build Api client options based on a domain.
   * @param {string} domain The domain to build the api client options based on.
   * @returns {ApiClientOptions}
   */
  static buildFromDomain(domain) {
    return new ApiClientOptions()
      .setBaseUrl(domain);
  }
}

export default BuildApiClientOptionsService;
