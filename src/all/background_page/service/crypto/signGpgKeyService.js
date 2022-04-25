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

const {assertDecryptedPrivateKeys, assertPublicKeys} = require("../../utils/openpgp/openpgpAssertions");

class SignGpgKeyService {
  /**
   * Signs a key.
   *
   * @param {string|openpgp.PublicKey} publicKeyToSign The public key to sign.
   * @param {Array<string|openpgp.PrivateKey>|string|openpgp.PrivateKey} signingKeys The key(s) to use to sign.
   * @returns {Promise<openpgp.PublicKey>}
   */
  static async sign(publicKeyToSign, signingKeys) {
    if (Array.isArray(publicKeyToSign)) {
      throw new TypeError('Only a single public key is allowed to be signed.');
    }
    publicKeyToSign = await assertPublicKeys(publicKeyToSign);
    signingKeys = await assertDecryptedPrivateKeys(signingKeys);
    if (!Array.isArray(signingKeys)) {
      signingKeys = [signingKeys];
    }

    return publicKeyToSign.signAllUsers(signingKeys);
  }
}

exports.SignGpgKeyService = SignGpgKeyService;
