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
 * @since         3.9.0
 */

class GenerateSsoKeyService {
  /**
   * Generate an AES-GCM key to be used for SSO.
   *
   * @param {boolean} extractable does the key should be extractable or not.
   * @returns {Promise<CryptoKey>}
   */
  static async generateSsoKey(extractable = false) {
    const algorithm = {
      name: "AES-GCM",
      length: 256
    };
    const capabilities = ["encrypt", "decrypt"];
    return crypto.subtle.generateKey(algorithm, extractable, capabilities);
  }
}

export default GenerateSsoKeyService;
