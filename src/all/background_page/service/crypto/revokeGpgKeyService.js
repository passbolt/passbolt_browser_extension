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

const {ExternalGpgKeyEntity} = require("../../model/entity/gpgkey/external/externalGpgKeyEntity");
const {GpgKeyInfoService} = require("./gpgKeyInfoService");

class RevokeGpgKeyService {
  /**
   * @param {ExternalGpgKeyEntity} gpgKeyToRevoke
   */
  static async revoke(gpgKeyToRevoke) {
    const key = (await openpgp.key.readArmored(gpgKeyToRevoke.armoredKey)).keys[0];
    const revokedKey = await key.revoke();
    const keyInfo = await GpgKeyInfoService.getKeyInfoFromOpenGpgKey(revokedKey);
    return new ExternalGpgKeyEntity(keyInfo);
  }
}

exports.RevokeGpgKeyService = RevokeGpgKeyService;
