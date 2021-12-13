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

const {GenerateGpgKeyPairEntity} = require('../../model/entity/gpgkey/generate/generateGpgKeyPairEntity');
const {ExternalGpgKeyPairEntity} = require('../../model/entity/gpgkey/external/externalGpgKeyPairEntity');
const {ExternalGpgKeyEntity} = require('../../model/entity/gpgkey/external/externalGpgKeyEntity');

class GenerateGpgKeyPairService {
  /**
   * @param {ExternalGpgKeyEntity} key
   */
  static async generateKeyPair(generateGpgKeyPairDto) {
    const generateGpgKeyPairEntity = new GenerateGpgKeyPairEntity(generateGpgKeyPairDto);
    const opengpgKeyPair = await openpgp.generateKey(generateGpgKeyPairEntity.toOpenPgpGenerateKeyDto());

    return new ExternalGpgKeyPairEntity({
      public_key: new ExternalGpgKeyEntity({armored_key: opengpgKeyPair.publicKeyArmored}),
      private_key: new ExternalGpgKeyEntity({armored_key: opengpgKeyPair.privateKeyArmored})
    });
  }
}

exports.GenerateGpgKeyPairService = GenerateGpgKeyPairService;
