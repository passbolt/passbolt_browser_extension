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
import User from "../../model/user";

class ParseWebIntegrationUrlService {
  /**
   * Get regex to check URI validity
   * @returns {RegExp}
   */
  static get regex() {
    const user = User.getInstance();
    const escapedDomain = user.settings.getDomain().replace(/\W/g, "\\$&");
    // Regex to check this is not our domain or chrome and about page
    return new RegExp(`^(?!(${escapedDomain}|chrome:|about:|https:\/\/www\.passbolt\.com)).*$`);
  }

  /**
   * Test regex with the url.
   * @param {string} url The url to test.
   * @returns {boolean}
   */
  static test(url) {
    try {
      // Check if the url is valid
      new URL(url);
      return this.regex.test(url);
    } catch (error) {
      return false;
    }
  }
}

export default ParseWebIntegrationUrlService;
