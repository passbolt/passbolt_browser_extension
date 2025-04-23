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

class DecryptMessageService {
  /**
   * Decrypt symmetrically a message
   *
   * @param {openpgp.Message} message The message to decrypt.
   * @param {string} password The password to use to decrypt the message.
   * @param {array<openpgp.PublicKey|openpgp.PrivateKey>} verificationKeys The private key(s) to use to sign the message.
   * @returns {Promise<string>}
   */
  static async decryptSymmetrically(message, password, verificationKeys = null) {
    if (verificationKeys) {
      OpenpgpAssertion.assertKeys(verificationKeys);
    }
    OpenpgpAssertion.assertMessage(message);

    const {data: decryptedMessage, signatures} = await openpgp.decrypt({
      message: message,
      passwords: [password],
      verificationKeys: verificationKeys,
      expectSigned: Boolean(verificationKeys)
    });

    if (verificationKeys) {
      await this.doSignatureVerification(signatures);
    }

    return decryptedMessage;
  }

  /**
   * Decrypt a message encrypted with one session key.
   *
   * @param {openpgp.Message} message The message to decrypt.
   * @param {openpgp.SessionKey} sessionKey The sessionKey to use to decrypt the message.
   * @param {array<openpgp.PublicKey|openpgp.PrivateKey>} verificationKeys The private key(s) to use to sign the message.
   * @returns {Promise<string>}
   */
  static async decryptWithSessionKey(message, sessionKey, verificationKeys = null) {
    if (verificationKeys) {
      OpenpgpAssertion.assertKeys(verificationKeys);
    }
    OpenpgpAssertion.assertMessage(message);
    OpenpgpAssertion.assertSessionKey(sessionKey);

    const {data: decryptedMessage, signatures} = await openpgp.decrypt({
      message: message,
      sessionKeys: sessionKey,
      verificationKeys: verificationKeys,
      expectSigned: Boolean(verificationKeys)
    });

    if (verificationKeys) {
      await this.doSignatureVerification(signatures);
    }

    return decryptedMessage;
  }

  /**
   * Decrypt a text message with signature.
   *
   * @param {openpgp.Message} message The message to decrypt.
   * @param {openpgp.PrivateKey} decryptionKey The private key to use to decrypt the message
   * @param {array<openpgp.PublicKey|openpgp.PrivateKey>} verificationKeys (optional) The key(s) to check the signature for.
   * @param {boolean} [options.throwOnInvalidSignaturesVerification=true] Should throw when verifying the signatures corresponding to the verification keys
   * @param {boolean} [options.returnOnlyData=true] Should return only data without signatures
   * @returns {Promise<string|openpgp.DecryptMessageResult>}
   * @throws {Error} if the given signatures don't match the message to decrypt.
   */
  static async decrypt(message, decryptionKey, verificationKeys = null, options = {}) {
    OpenpgpAssertion.assertMessage(message);
    OpenpgpAssertion.assertDecryptedPrivateKey(decryptionKey);

    const throwOnInvalidSignaturesVerification = options?.throwOnInvalidSignaturesVerification !== false && Boolean(verificationKeys);
    const returnOnlyData = options?.returnOnlyData !== false;

    if (verificationKeys) {
      OpenpgpAssertion.assertKeys(verificationKeys);
    }

    const rawResult = await openpgp.decrypt({
      message: message,
      decryptionKeys: decryptionKey,
      verificationKeys: verificationKeys,
      expectSigned: throwOnInvalidSignaturesVerification
    });

    if (throwOnInvalidSignaturesVerification) {
      await this.doSignatureVerification(rawResult.signatures);
    }

    if (returnOnlyData) {
      return rawResult.data;
    }

    return rawResult;
  }

  /**
   * Assert signatures.
   *
   * @param {Array<openpgp.Signature>} signatures The signatures to run the verification for
   * @returns {Promise<void>}
   * @throws {Error} if any of the signature does not verify the message.
   */
  static async doSignatureVerification(signatures) {
    /*
     * Openpgp.js's signatures is an array of signature to verify.
     * The verification process is run by starting a promise from the signature.verified field.
     * The promise is set to always return true but, throws an exception if it can't be verified.
     * So here, basically we expect to have an exception to be thrown if one of the
     * expected signature is not ok.
     */
    const verificationPromises = signatures.map(signature => signature.verified);
    await Promise.all(verificationPromises);
  }
}

export default DecryptMessageService;
