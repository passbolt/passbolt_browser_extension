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
 * @since         3.7.3
 */

class GenerateSsoIvService {
  /**
   * Generate an AES-GCM key to be used for SSO.
   *
   * @param {integer} length size of the IV to generate.
   * @returns {UInt8Array}
   */
  static generateIv(length = 12) {
    return crypto.getRandomValues(new Uint8Array(length));
  }
}

export default GenerateSsoIvService;
