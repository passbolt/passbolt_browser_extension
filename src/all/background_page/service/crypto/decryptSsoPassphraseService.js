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
import {Buffer} from 'buffer';

class DecryptSsoPassphraseService {
  /**
   * Decrypt a given ciphered text using an AES-GCM generated key and with the given IV.
   *
   * @param {string} text a base64 string to decipher with keys and ivs.
   * @param {CryptoKey} nek the non-extractable key used to decrypt the text on second round
   * @param {CryptoKey} ek the extractable key used to decrypt the text on first round
   * @param {Uint8Array} iv1 the initialization vector for the second encryption round
   * @param {Uint8Array} iv2 the initialization vector for the first encryption round
   * @returns {Promise<string>} the deciphered string
   */
  static async decrypt(base64Text, nek, ek, iv1, iv2) {
    const buffer = Buffer.from(base64Text, 'base64');
    const firstDecryptionAlgorithm = {
      name: ek.algorithm.name,
      iv: iv2
    };
    const secondDecryptionAlgorithm = {
      name: nek.algorithm.name,
      iv: iv1
    };

    const firstDecryptionBuffer = await crypto.subtle.decrypt(firstDecryptionAlgorithm, ek, buffer);
    const secondDecryptionBuffer = await crypto.subtle.decrypt(secondDecryptionAlgorithm, nek, firstDecryptionBuffer);
    return Buffer.from(secondDecryptionBuffer).toString();
  }
}

export default DecryptSsoPassphraseService;
