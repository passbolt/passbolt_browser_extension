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

const {GetGpgKeyInfoService} = require("./getGpgKeyInfoService");

class RevokeGpgKeyService {
  /**
   * @param {Promise<ExternalGpgKeyEntity>} gpgKeyToRevoke
   */
  static async revoke(gpgKeyToRevoke) {
    const {publicKey} = await openpgp.revokeKey({
      key: (await openpgp.key.readArmored(gpgKeyToRevoke.armoredKey)).keys[0]
    });
    return await GetGpgKeyInfoService.getKeyInfo(publicKey);
  }
}

exports.RevokeGpgKeyService = RevokeGpgKeyService;
