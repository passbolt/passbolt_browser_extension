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
import {Buffer} from "buffer";
import {assertExtractableSsoKey, assertNonExtractableSsoKey, assertValidInitialisationVector} from "../../utils/assertions";

class EncryptSsoPassphraseService {
  /**
   * Encrypt a given text using an AES-GCM generated keys and with the given IVs.
   *
   * @param {string} text text to cipher with the given key and IV.
   * @param {CryptoKey} nek the non-extractable key used to encrypt the text on first round
   * @param {CryptoKey} ek the extractable key used to encrypt the text on second round
   * @param {Uint8Array} iv1 the initialization vector for the first encryption round
   * @param {Uint8Array} iv2 the initialization vector for the second encryption round
   * @returns {Promise<string>} a base64 string ready for serialization
   */
  static async encrypt(text, nek, ek, iv1, iv2) {
    assertNonExtractableSsoKey(nek);
    assertExtractableSsoKey(ek);
    assertValidInitialisationVector(iv1);
    assertValidInitialisationVector(iv2);

    const buffer = Buffer.from(text);

    const firstEncryptionAlgorithm = {
      name: nek.algorithm.name,
      iv: iv1
    };

    const secondEncryptionAlgorithm = {
      name: ek.algorithm.name,
      iv: iv2
    };

    const firstEncryption = await crypto.subtle.encrypt(firstEncryptionAlgorithm, nek, buffer);
    const cipheredBuffer = await crypto.subtle.encrypt(secondEncryptionAlgorithm, ek, firstEncryption);
    return Buffer.from(cipheredBuffer).toString('base64');
  }
}

export default EncryptSsoPassphraseService;
