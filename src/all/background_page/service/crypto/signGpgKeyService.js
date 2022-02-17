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

const {GetGpgKeyInfoService} = require("./getGpgKeyInfoService");

class SignGpgKeyService {
  /**
   * Signs a key with the given collection of key.
   *
   * @param {ExternalGpgKeyEntity} gpgKeyToSign
   * @param {ExternalGpgKeyCollection} gpgKeyCollection
   * @returns {Promise<ExternalGpgKeyEntity>}
   */
  static async sign(gpgKeyToSign, gpgKeyCollection) {
    const keyToSign = (await openpgp.key.readArmored(gpgKeyToSign.armoredKey)).keys[0];
    const signingKeys = [];
    for (let i = 0; i < gpgKeyCollection.items.length; i++) {
      const keys = (await openpgp.key.readArmored(gpgKeyCollection.items[i].armoredKey)).keys;
      keys.forEach(key => { signingKeys.push(key); });
    }

    const signedKey = await keyToSign.signAllUsers(signingKeys);
    return await GetGpgKeyInfoService.getKeyInfo(signedKey);
  }
}

exports.SignGpgKeyService = SignGpgKeyService;
