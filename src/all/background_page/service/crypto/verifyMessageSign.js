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
import DecryptMessageService from './decryptMessageService';

class VerifyMessageService {
  /**
   * Sign a text message with the public or/and private key.
   *
   * @param {openpgp.Message} message The message to sign.
   * @param {array<openpgp.PublicKey|openpgp.PrivateKey>} verificationKeys (optional) The key(s) to check the signature for.
   * @returns {Promise<string>}
   * @throws {TypeError}  If the message is not a valid openpgp.Message
   * @throws {TypeError}  If one of the provided key is not a valid openpgp.PublicKey or openpgp.PrivateKey
   * @throws {TypeError}  If the message cannot be verified
   */
  static async verify(message, verificationKeys) {
    OpenpgpAssertion.assertMessage(message);
    OpenpgpAssertion.assertKeys(verificationKeys);

    const verificationResult = await openpgp.verify({message, verificationKeys});
    await DecryptMessageService.doSignatureVerification(verificationResult.signatures);
  }

  /**
   * Sign a text clear text message with the public or/and private keys
   *
   * @param {openpgp.CleartextMessage} message The clear text message to sign.
   * @param {array<openpgp.PublicKey|openpgp.PrivateKey>} verificationKeys (optional) The key(s) to check the signature for.
   * @returns {Promise<string>}
   * @throws {TypeError}  If the message is not a valid openpgp.Message
   * @throws {TypeError}  If one of the provided key is not a valid openpgp.PublicKey or openpgp.PrivateKey
   * @throws {TypeError}  If the message cannot be verified
   */
  static async verifyClearMessage(message, verificationKeys) {
    OpenpgpAssertion.assertClearMessage(message);
    OpenpgpAssertion.assertKeys(verificationKeys);
    const verificationResult = await openpgp.verify({message, verificationKeys});
    await DecryptMessageService.doSignatureVerification(verificationResult.signatures);
  }
}

export default VerifyMessageService;
