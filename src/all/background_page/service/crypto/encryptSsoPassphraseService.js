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

class EncryptSsoPassphraseService {
  /**
   * Generate an AES-GCM key to be used for SSO.
   *
   * @param {string} text text to cipher with the given key and IV.
   * @param {CryptoKey} key key used to encrypt the text
   * @param {Uint8Array} iv the initialization vector with which to encrypt the data
   * @returns {Promise<string>}
   */
  static async encrypt(text, key, iv) {
    const encoder = new TextEncoder();
    const buffer = encoder.encode(text);

    const encryptionAlgorithm = {
      name: key.algorithm.name,
      iv: iv
    };

    const encryptedBuffer = await crypto.subtle.encrypt(encryptionAlgorithm, key, buffer);

    const decoder = new TextDecoder();
    return decoder.decode(encryptedBuffer);
  }
}

export default EncryptSsoPassphraseService;
