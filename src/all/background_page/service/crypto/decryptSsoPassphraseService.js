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
import {Buffer} from 'buffer';
import OutdatedSsoKitError from '../../error/outdatedSsoKitError';
import {
  assertBase64String,
  assertNonExtractableSsoKey,
  assertExtractableSsoKey,
  assertValidInitialisationVector
} from '../../utils/assertions';

class DecryptSsoPassphraseService {
  /**
   * Decrypt a given ciphered text using an AES-GCM generated keys and with the given IVs.
   *
   * @param {string} text a base64 string to decipher with keys and ivs.
   * @param {CryptoKey} nek the non-extractable key used to decrypt the text on second round
   * @param {CryptoKey} ek the extractable key used to decrypt the text on first round
   * @param {Uint8Array} iv1 the initialization vector for the second encryption round
   * @param {Uint8Array} iv2 the initialization vector for the first encryption round
   * @returns {Promise<string>} the deciphered string
   */
  static async decrypt(base64Text, nek, ek, iv1, iv2) {
    assertBase64String(base64Text);
    assertNonExtractableSsoKey(nek);
    assertExtractableSsoKey(ek);
    assertValidInitialisationVector(iv1);
    assertValidInitialisationVector(iv2);

    const buffer = Buffer.from(base64Text, 'base64');
    const firstDecryptionAlgorithm = {
      name: ek.algorithm.name,
      iv: iv2
    };
    const secondDecryptionAlgorithm = {
      name: nek.algorithm.name,
      iv: iv1
    };

    let firstDecryptionBuffer = null;
    try {
      firstDecryptionBuffer = await crypto.subtle.decrypt(firstDecryptionAlgorithm, ek, buffer);
    } catch (e) {
      /**
       * This might happen if a backup client side or server side was done and both kits are mismatching.
       */
      console.error(e);
      throw new OutdatedSsoKitError(`Unable to decrypt passphrase from the server SSO kit: ${e.message}`);
    }

    let secondDecryptionBuffer = null;
    try {
      secondDecryptionBuffer = await crypto.subtle.decrypt(secondDecryptionAlgorithm, nek, firstDecryptionBuffer);
    } catch (e) {
      /**
       * This can happen if the local SSO kit nek and/or iv1 has changed (manually?).
       */
      console.error(e);
      throw new Error(`Unable to decrypt passphrase with the local SSO kit: ${e.message}`);
    }

    return Buffer.from(secondDecryptionBuffer).toString();
  }
}

export default DecryptSsoPassphraseService;
