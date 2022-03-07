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
   * Signs a key with the given collection of key.
   *
   * @param {string|openpgp.PublicKey} gpgKeyToSign
   * @param {Array<string|openpgp.PrivateKey>} gpgKeyCollection
   * @returns {Promise<openpgp.PublicKey>}
   */
  static async sign(gpgKeyToSign, gpgKeyCollection) {
    gpgKeyToSign = await assertPublicKeys(gpgKeyToSign);
    const signingKeys = [];
    for (let i = 0; i < gpgKeyCollection.length; i++) {
      const key = await assertDecryptedPrivateKeys(gpgKeyCollection[i]);
      signingKeys.push(key);
    }
    return gpgKeyToSign.signAllUsers(signingKeys);
  }
}

exports.SignGpgKeyService = SignGpgKeyService;
