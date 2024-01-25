/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.3.0
 */

import * as openpgp from 'openpgp';
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";

class SignMessageService {
  /**
   * Sign a text message with the private key.
   *
   * @param {openpgp.Message} message The message to sign.
   * @param {openpgp.PrivateKey} signingKeys The private key to use to sign the message.
   * @returns {Promise<string>}
   * @throws {TypeError}  If the message is not a valid openpgp.Message
   * @throws {TypeError}  If one of the provided key is not a valid openpgp.PrivateKey
   */
  static async signMessage(message, signingKeys) {
    OpenpgpAssertion.assertMessage(message);
    OpenpgpAssertion.assertDecryptedPrivateKeys(signingKeys);

    const signedMesage = await openpgp.sign({message: message, signingKeys: signingKeys});
    return signedMesage;
  }

  /**
   * Sign a clear text message with the private key.
   *
   * @param {openpgp.CleartextMessage} message The cleartext message to sign.
   * @param {openpgp.PrivateKey} signingKeys The private key to use to sign the message.
   * @returns {Promise<string>}
   * @throws {TypeError}  If the message is not a valid openpgp.Message
   * @throws {TypeError}  If one of the provided key is not a valid openpgp.PrivateKey
   */
  static async signClearMessage(message, signingKeys) {
    OpenpgpAssertion.assertClearMessage(message);
    OpenpgpAssertion.assertDecryptedPrivateKeys(signingKeys);

    const signedMesage = await openpgp.sign({message: message, signingKeys: signingKeys});
    return signedMesage;
  }
}


export default SignMessageService;
