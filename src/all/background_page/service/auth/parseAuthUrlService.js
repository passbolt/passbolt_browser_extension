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

class ParseAuthUrlService {
  /**
   * Get regex to check URI validity
   * @param {AccountEntity} account The user account
   * @returns {RegExp}
   */
  static getRegex(account) {
    assertType(account, AccountEntity);
    const escapedDomain = account.domain.replace(/\W/g, "\\$&");
    return new RegExp(`^${escapedDomain}/auth/login/?(#.*)?(\\?.*)?$`);
  }

  /**
   * Test regex with the url.
   * @param {AccountEntity} account The user account
   * @param {string} url The url to test.
   * @returns {boolean}
   */
  static test(account, url) {
    assertType(account, AccountEntity);
    assertString(url);
    return this.getRegex(account).test(url);
  }
}

export default ParseAuthUrlService;
