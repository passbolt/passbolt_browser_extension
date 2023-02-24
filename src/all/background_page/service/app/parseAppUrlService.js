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
import User from "../../model/user";

class ParseAppUrlService {
  /**
   * Get regex to check URI validity
   * @returns {string}
   */
  static getRegex() {
    const user = User.getInstance();
    const escapedDomain = user.settings.getDomain().replace(/\W/g, "\\$&");
    return `^${escapedDomain}/?(/app.*)?(#.*)?$`;
  }

  /**
   * Parse url to match .
   * @param {string} url The url to parse.
   * @returns {{domain: string}}
   * @throw {Error} If the setup url cannot be parsed.
   */
  static parse(url) {
    const regex = new RegExp(this.getRegex());

    if (!regex.test(url)) {
      throw new Error(
        "Cannot parse application url. The url does not match the pattern."
      );
    }

    // Sanitize domains, removed trailing "/" in order to avoid domains such as https://passbolt.dev//
    url = url.replace(/\/*$/g, "");
    try {
      new URL(url);
    } catch (error) {
      throw new Error("Cannot parse application url. The domain is not valid.");
    }
  }

  /**
   * Test the url against the regex.
   * @param {string} url The url to test
   * @returns {boolean}
   */
  static test(url) {
    try {
      this.parse(url);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default ParseAppUrlService;
