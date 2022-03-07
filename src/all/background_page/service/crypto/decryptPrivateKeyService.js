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

const {InvalidMasterPasswordError} = require("../../error/invalidMasterPasswordError");
const {assertPrivateKeys} = require("../../utils/openpgp/openpgpAssertions");

class DecryptPrivateKeyService {
  /**
   * Decrypt a private key with the given passphrase.
   *
   * @param {PrivateGpgkeyEntity} privateKey
   * @returns {Promise<string>} the armored private key decrypted
   * @throws {InvalidMasterPasswordError} if the key cannot be decrypted with the passphrase
   */
  static async decryptPrivateGpgKeyEntity(privateGpgKeyEntity) {
    return this.decrypt(privateGpgKeyEntity.armoredKey, privateGpgKeyEntity.passphrase);
  }

  /**
   * Decrypt a private key with the given passphrase.
   *
   * @param {openpgp.PrivateKey|string} privateKey the private key to decrypt
   * @param {string} passphrase the passphrase with which to do the decryption operation
   * @returns {Promise<string>} the armored private key decrypted
   * @throws {InvalidMasterPasswordError} if the key cannot be decrypted with the passphrase
   * @throws {Error} If the private key is already decrypted.
   */
  static async decrypt(privateKey, passphrase) {
    privateKey = await assertPrivateKeys(privateKey);
    if (privateKey.isDecrypted()) {
      throw new Error("The private key is already decrypted");
    }

    return (await openpgp.decryptKey({
      privateKey: privateKey,
      passphrase: passphrase
    }).catch(() => { throw new InvalidMasterPasswordError(); })).armor();
  }
}

exports.DecryptPrivateKeyService = DecryptPrivateKeyService;
