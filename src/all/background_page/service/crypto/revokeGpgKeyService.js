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

class RevokeGpgKeyService {
  /**
   * Revoke a key.
   *
   * @param {openpgp.PrivateKey|string} privateKeyToRevoke The private key to revoke.
   * @returns {Promise<string>} the revoked public armored key
   */
  static async revoke(privateKeyToRevoke) {
    if (Array.isArray(privateKeyToRevoke)) {
      throw new TypeError('Only a single private key is allowed to be revoked.');
    }
    privateKeyToRevoke = await assertDecryptedPrivateKeys(privateKeyToRevoke);
    const {publicKey} = await openpgp.revokeKey({
      key: privateKeyToRevoke
    });
    return publicKey;
  }
}

exports.RevokeGpgKeyService = RevokeGpgKeyService;
