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

const {assertKeys} = require("../../utils/openpgp/openpgpAssertions");

class VerifyGpgKeyService {
  /**
   * Verify a key signatures.
   *
   * @param {string|openpgp.PublicKey|openpgp.PrivateKey} keyToVerify The key to verify.
   * @param {Array<string|openpgp.PublicKey|openpgp.PrivateKey>|string|openpgp.PublicKey|openpgp.PrivateKey} verifyingKeys The key(s) to use to verify the signature.
   * @returns {Promise<boolean>}
   */
  static async verify(keyToVerify, verifyingKeys) {
    if (Array.isArray(keyToVerify)) {
      throw new TypeError('Only a single public key is allowed to be verified.');
    }
    keyToVerify = await assertKeys(keyToVerify);
    verifyingKeys = await assertKeys(verifyingKeys);
    if (!Array.isArray(verifyingKeys)) {
      verifyingKeys = [verifyingKeys];
    }

    const result = await keyToVerify.verifyAllUsers(verifyingKeys);
    const signaturesVerifiedCount = result.filter(item => item.valid).length;
    return signaturesVerifiedCount === verifyingKeys.length;
  }
}

exports.VerifyGpgKeyService = VerifyGpgKeyService;
