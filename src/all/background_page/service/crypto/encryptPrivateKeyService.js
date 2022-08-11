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
import {ValidatorRule as Validator} from "../../utils/validatorRules";

class EncryptPrivateKeyService {
  /**
   * Decrypt a private key with the given passphrase.
   *
   * @param {openpgp.PrivateKey} decryptedPrivateKey the private key to encrypt
   * @param {string} passphrase the passphrase to use to protect the private key
   * @returns {Promise<openpgp.PrivateKey>} the encrypted private key
   * @throws {Error} If the private key is already encrypted.
   * @throws {Error} If the passphrase is not a valid utf8 string
   */
  static async encrypt(decryptedPrivateKey, passphrase) {
    OpenpgpAssertion.assertDecryptedPrivateKey(decryptedPrivateKey);
    if (!Validator.isUtf8(passphrase)) {
      throw new Error('The passphrase should be a valid UTF8 string.');
    }

    return (await openpgp.encryptKey({
      privateKey: decryptedPrivateKey,
      passphrase: passphrase,
    }));
  }
}

export default EncryptPrivateKeyService;
