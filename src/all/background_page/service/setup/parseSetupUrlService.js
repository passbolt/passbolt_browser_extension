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

class ParseSetupUrlService {
  /**
   * Parse a setup url.
   * @param {string} url The setup url.
   * @returns {{user_id: string, domain: string, authentication_token_token: string}}
   * @throw {Error} If the setup url cannot be parsed.
   * @throw {Error} If the domain is not valid.
   */
  static parse(url) {
    const uuidRegex = "[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[0-5][a-fA-F0-9]{3}-[089aAbB][a-fA-F0-9]{3}-[a-fA-F0-9]{12}";
    const regex = new RegExp(`(.*)\/setup\/(install|start)\/(${uuidRegex})\/(${uuidRegex})`);

    if (!regex.test(url)) {
      throw new Error('Cannot parse setup url. The url does not match the pattern.');
    }

    const parsedUrl = url.match(regex);
    let [, domain] = parsedUrl;
    const [, , , user_id, authentication_token_token] = parsedUrl;

    // Sanitize domains, removed trailing "/" in order to avoid domains such as https://passbolt.dev//
    domain = domain.replace(/\/*$/g, '');

    try {
      new URL(domain);
    } catch (error) {
      throw new Error('Cannot parse setup url. The domain is not valid.');
    }

    return {domain, user_id, authentication_token_token};
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

export default ParseSetupUrlService;
