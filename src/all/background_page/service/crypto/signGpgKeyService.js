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

class SignGpgKeyService {
  /**
   * @param {ExternalGpgKeyEntity} gpgKeyToSign
   * @param {ExternalGpgKeyCollection} gpgKeyCollection
   */
  static async sign(gpgKeyToSign, gpgKeyCollection) {
    const keyToSign = (await openpgp.key.readArmored(gpgKeyToSign.armoredKey)).keys[0];
    const signingKeys = [];
    for (let i = 0; i < gpgKeyCollection.items.length; i++) {
      const keys = (await openpgp.key.readArmored(gpgKeyCollection.items[i].armoredKey)).keys;
      keys.forEach(key => { signingKeys.push(key); });
    }

    const signedKey = await keyToSign.signAllUsers(signingKeys);
    const keyInfo = await GpgKeyInfoService.getKeyInfoFromOpenGpgKey(signedKey);
    return new ExternalGpgKeyEntity(keyInfo);
  }
}

exports.SignGpgKeyService = SignGpgKeyService;
