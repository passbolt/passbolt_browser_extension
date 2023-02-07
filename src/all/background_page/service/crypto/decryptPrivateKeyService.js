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
import InvalidMasterPasswordError from "../../error/invalidMasterPasswordError";
import {assertPassphrase} from '../../utils/assertions';

class DecryptPrivateKeyService {
  /**
   * Decrypt a private key with the given passphrase.
   *
   * @param {openpgp.PrivateKey} privateKey the private key to decrypt
   * @param {string} passphrase the passphrase with which to do the decryption operation
   * @returns {Promise<openpgp.PrivateKey>} the private key decrypted
   * @throws {InvalidMasterPasswordError} if the key cannot be decrypted with the passphrase
   * @throws {Error} If the private key is already decrypted.
   */
  static async decrypt(privateKey, passphrase) {
    OpenpgpAssertion.assertEncryptedPrivateKey(privateKey);
    assertPassphrase(passphrase);

    try {
      return (await openpgp.decryptKey({
        privateKey: privateKey,
        passphrase: passphrase
      }));
    } catch (error) {
      throw new InvalidMasterPasswordError();
    }
  }
}

export default DecryptPrivateKeyService;
