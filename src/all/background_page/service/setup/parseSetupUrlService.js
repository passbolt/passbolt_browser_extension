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
   * @returns {{user_id: string, domain: string, token: string}}
   * @throws {Error} If the setup url cannot be parsed.
   */
  static parse(url) {
    const uuidRegex = "[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[0-5][a-fA-F0-9]{3}-[089aAbB][a-fA-F0-9]{3}-[a-fA-F0-9]{12}";
    const regex = new RegExp(`(.*)\/setup\/(install|recover)\/(${uuidRegex})\/(${uuidRegex})`);
    if (regex.test(url)) {
      const [, domain, , user_id, token] = url.match(regex);
      return {domain, user_id, token};
    }
    throw new Error('Cannot parse setup url.');
  }
}

exports.ParseSetupUrlService = ParseSetupUrlService;
