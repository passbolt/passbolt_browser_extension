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

const {Keyring} = require("../../model/keyring");
const {DecryptPrivateKeyService} = require("../crypto/decryptPrivateKeyService");

class GetDecryptedUserPrivateKeyService {
  /**
   * Get current user's private key and decrypts it.
   *
   * @param {string} passphrase The user's private key passphrase to decrypt to key.
   * @returns {Promise<string>}
   */
  static async getKey(passphrase) {
    const keyring = new Keyring();
    const userPrivateKey = keyring.findPrivate();
    if (!userPrivateKey) {
      throw new Error("Can't find current user's private key.");
    }
    return await DecryptPrivateKeyService.decrypt(userPrivateKey.armoredKey, passphrase);
  }
}

exports.GetDecryptedUserPrivateKeyService = GetDecryptedUserPrivateKeyService;
