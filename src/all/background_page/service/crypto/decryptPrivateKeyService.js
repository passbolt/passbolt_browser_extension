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
const {ExternalGpgKeyEntity} = require("../../model/entity/gpgkey/external/externalGpgKeyEntity");
const {GpgKeyInfoService} = require("./gpgKeyInfoService");

class DecryptPrivateKeyService {
  /**
   * @param {PrivateGpgkeyEntity} privateKey
   * @return {Promise<ExternalGpgKeyEntity>}
   */
  static async decryptPrivateGpgKeyEntity(privateGpgKeyEntity) {
    const privateKey = await this.decrypt(privateGpgKeyEntity.armoredKey, privateGpgKeyEntity.passphrase);

    return await GpgKeyInfoService.getKeyInfoFromOpenGpgKey(privateKey)
      .then(keyInfo => new ExternalGpgKeyEntity(keyInfo));
  }

  /**
   *
   * @param {string} armoredKey
   * @param {string} passphrase
   * @returns {Promise<*>}
   */
  static async decrypt(armoredKey, passphrase) {
    const privateKey = (await openpgp.key.readArmored(armoredKey)).keys[0];
    await privateKey.decrypt(passphrase)
      .catch(() => { throw new InvalidMasterPasswordError(); });

    return privateKey;
  }
}

exports.DecryptPrivateKeyService = DecryptPrivateKeyService;