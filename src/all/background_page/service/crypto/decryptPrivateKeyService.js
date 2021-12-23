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
 * @since         3.5.0
 */

const {InvalidMasterPasswordError} = require("../../error/invalidMasterPasswordError");

class DecryptPrivateKeyService {
  /**
   * @param {PrivateGpgKeyEntity} privateKey
   * @return {boolean}
   */
  static async decrypt(privateGpgkeyEntity) {
    const privateKey = (await openpgp.key.readArmored(privateGpgkeyEntity.armoredKey)).keys[0];

    return await privateKey.decrypt(privateGpgkeyEntity.passphrase)
      .catch(() => { throw new InvalidMasterPasswordError(); });
  }
}

exports.DecryptPrivateKeyService = DecryptPrivateKeyService;
