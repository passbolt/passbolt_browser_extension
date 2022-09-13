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

import * as openpgp from 'openpgp';
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";

class EncryptMessageService {
  /**
   * Encrypt symmetrically a message.
   *
   * @param {string} message The message to encrypt.
   * @param {array<string>} passwords The password to use to encrypt the message.
   * @param {array<openpgp.PrivateKey>} signingKeys The private key(s) to use to sign the message.
   * @returns {Promise<string>} the encrypted message in its armored version
   */
  static async encryptSymmetrically(message, passwords, signingKeys = null) {
    if (signingKeys) {
      OpenpgpAssertion.assertDecryptedPrivateKeys(signingKeys);
    }

    const gpgMessage = await OpenpgpAssertion.createMessageOrFail(message);
    return openpgp.encrypt({
      message: gpgMessage,
      passwords: passwords,
      signingKeys: signingKeys,
    });
  }

  /**
   * Encrypt and sign text message.
   *
   * @param {string} message The message to encrypt.
   * @param {openpgp.PublicKey} encryptionKey The public key(s) to use to encrypt the message
   * @param {array<openpgp.PrivateKey>} signingKeys The private key(s) to use to sign the message.
   * @returns {Promise<string>} the encrypted message in its armored version
   */
  static async encrypt(message, encryptionKey, signingKeys = null) {
    OpenpgpAssertion.assertPublicKey(encryptionKey);
    if (signingKeys) {
      OpenpgpAssertion.assertDecryptedPrivateKeys(signingKeys);
    }

    const gpgMessage = await OpenpgpAssertion.createMessageOrFail(message);
    return openpgp.encrypt({
      message: gpgMessage,
      encryptionKeys: encryptionKey,
      signingKeys: signingKeys,
    });
  }
}

export default EncryptMessageService;
