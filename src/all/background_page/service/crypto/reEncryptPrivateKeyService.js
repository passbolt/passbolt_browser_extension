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
import DecryptPrivateKeyService from "./decryptPrivateKeyService";
import EncryptPrivateKeyService from "./encryptPrivateKeyService";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import {ValidatorRule as Validator} from "../../utils/validatorRules";

class ReEncryptPrivateKeyService {
  /**
   * Re-encrypt a given PGP key with another passphrase.
   *
   * @param {openpgp.PrivateKey} encryptedPrivateKey the private key to re-encrypt with a new password.
   * @param {string} oldPassphrase the passphraase that can be used to decrypt the given encrypted key.
   * @param {string} newPassphrase the new passphrase with which to re-encrypt the given private key.
   * @returns {Promise<openpgp.PrivateKey>} the private key encrypted with the new password
   * @throws {Error} if oldPassphrase or newPassphrase are not valid passphrases.
   * @throws {Error} if encryptedPrivateArmoredKey is not a valid private key.
   * @throws {InvalidMasterPasswordError} if the private key can't be decrypted with oldPassphrase.
   */
  static async reEncrypt(encryptedPrivateKey, oldPassphrase, newPassphrase) {
    OpenpgpAssertion.assertEncryptedPrivateKey(encryptedPrivateKey);
    this._validatePassphrase(oldPassphrase);
    this._validatePassphrase(newPassphrase);

    const decryptedPrivateKey = await DecryptPrivateKeyService.decrypt(encryptedPrivateKey, oldPassphrase);
    return EncryptPrivateKeyService.encrypt(decryptedPrivateKey, newPassphrase);
  }

  /**
   * Ensure that the passphrase is valid.
   * A passphrase is considered valid if it is a valid UTF-8 string.
   *
   * @param {string} passphrase the string to check for being an UTF-8 string.
   * @throws {Error} if the given passphrase is not a valid UTF-8 string.
   * @private
   */
  static _validatePassphrase(passphrase) {
    if (!Validator.isUtf8(passphrase)) {
      throw new Error('The passphrase should be a valid UTF8 string.');
    }
  }
}

export default ReEncryptPrivateKeyService;
