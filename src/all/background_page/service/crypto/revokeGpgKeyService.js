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
   * Get a revoked public key from a given decrypted private key.
   *
   * @param {openpgp.PrivateKey|string} gpgKeyToRevoke
   * @returns {Promise<string>} an armored public key revoked
   */
  static async revoke(gpgKeyToRevoke) {
    gpgKeyToRevoke = await assertDecryptedPrivateKeys(gpgKeyToRevoke);
    const {publicKey} = await openpgp.revokeKey({
      key: gpgKeyToRevoke
    });
    return publicKey;
  }
}

exports.RevokeGpgKeyService = RevokeGpgKeyService;
