/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.10.0
 */
import { assertString, assertType } from "../../utils/assertions";
import AccountEntity from "../../model/entity/account/accountEntity";

class ParseWebIntegrationUrlService {
  /**
   * Get regex to check URI validity
   * @param {AccountEntity} account The account
   * @returns {RegExp}
   */
  static getRegex(account) {
    assertType(account, AccountEntity);
    const escapedDomain = account.domain.replace(/\W/g, "\\$&");
    // Regex to check this is not our domain or chrome and about page
    return new RegExp(`^(?!(${escapedDomain}|chrome:|about:|https:\\/\\/(www\\.passbolt|mail\\.google)\\.com)).*$`);
  }

  /**
   * Test regex with the url.
   * @param {AccountEntity} account The account
   * @param {string} url The url to test.
   * @returns {boolean}
   */
  static test(account, url) {
    assertType(account, AccountEntity);
    assertString(url);
    try {
      // Check if the url is valid
      new URL(url);
      return this.getRegex(account).test(url);
    } catch {
      return false;
    }
  }
}

export default ParseWebIntegrationUrlService;
