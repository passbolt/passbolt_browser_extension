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

const {assertDecryptedPrivateKeys} = require("../../utils/openpgp/openpgpAssertions");

class EncryptPrivateKeyService {
  /**
   * Decrypt a private key with the given passphrase.
   *
   * @param {openpgp.PrivateKey|string} decryptedPrivateKey the private key to encrypt
   * @param {string} passphrase the passphrase to use to protect the private key
   * @returns {Promise<string>} the armored private key encrypted
   * @throws {Error} If the private key is already encrypted.
   * @throws {Error} If the passphrase is not a valid utf8
   */
  static async encrypt(decryptedPrivateKey, passphrase) {
    if (Array.isArray(decryptedPrivateKey)) {
      throw new Error('Only a single private key is allowed to be encrypted.');
    }
    decryptedPrivateKey = await assertDecryptedPrivateKeys(decryptedPrivateKey);
    if (!Validator.isUtf8(passphrase)) {
      throw new Error('The passphrase should be a valid UTF8 string.');
    }

    return (await openpgp.encryptKey({
      privateKey: decryptedPrivateKey,
      passphrase: passphrase
    })).armor();
  }
}

exports.EncryptPrivateKeyService = EncryptPrivateKeyService;
