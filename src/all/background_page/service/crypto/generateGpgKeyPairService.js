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

const {ExternalGpgKeyPairEntity} = require('../../model/entity/gpgkey/external/externalGpgKeyPairEntity');

class GenerateGpgKeyPairService {
  /**
   * Generate a gpg key pair.
   *
   * @param {GenerateGpgKeyPairEntity} generateGpgKeyPairEntity The gpg generation parameter
   * @return {Promise<ExternalGpgKeyPairEntity>}
   */
  static async generateKeyPair(generateGpgKeyPairEntity) {
    const openpgpKeyPair = await openpgp.generateKey(generateGpgKeyPairEntity.toGenerateOpenpgpKeyDto());

    return new ExternalGpgKeyPairEntity({
      public_key: {armored_key: openpgpKeyPair.publicKeyArmored},
      private_key: {armored_key: openpgpKeyPair.privateKeyArmored}
    });
  }
}

exports.GenerateGpgKeyPairService = GenerateGpgKeyPairService;
