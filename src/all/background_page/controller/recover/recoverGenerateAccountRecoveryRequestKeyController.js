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

const {GenerateGpgKeyPairEntity} = require("../../model/entity/gpgkey/generate/generateGpgKeyPairEntity");
const {GenerateGpgKeyPairService} = require("../../service/crypto/generateGpgKeyPairService");
const {GetGpgKeyInfoService} = require("../../service/crypto/getGpgKeyInfoService");

class RecoverGenerateAccountRecoveryRequestKeyController {
  /**
   * Constructor.
   * @param {Worker} worker The associated worker.
   * @param {string} requestId The associated request id.
   * @param {SetupEntity} setupEntity The associated setup entity.
   */
  constructor(worker, requestId, setupEntity) {
    this.worker = worker;
    this.requestId = requestId;
    this.setupEntity = setupEntity;
  }

  /**
   * Controller executor.
   * @param {Object} generateGpgKeyPairDto The generate gpg key pair dto.
   * @returns {Promise<void>}
   */
  async _exec(generateGpgKeyPairDto) {
    try {
      await this.exec(generateGpgKeyPairDto);
      this.worker.port.emit(this.requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Generate an account recovery gpg key
   * @param {Object} generateGpgKeyPairDto The generate gpg key pair dto.
   * @returns {Promise<void>}
   */
  async exec(generateGpgKeyPairDto) {
    const dto = {
      name: 'Account recovery request key',
      email: this.setupEntity?.user?.username,
      passphrase: generateGpgKeyPairDto?.passphrase,
      keySize: GenerateGpgKeyPairEntity.DEFAULT_LENGTH
    };
    const generateGpgKeyPairEntity = new GenerateGpgKeyPairEntity(dto);
    const externalGpgKeyPair = await GenerateGpgKeyPairService.generateKeyPair(generateGpgKeyPairEntity);
    const publicGpgKeyInfo = await GetGpgKeyInfoService.getKeyInfo(externalGpgKeyPair.publicKey);
    this.setupEntity.userPrivateArmoredKey = externalGpgKeyPair.privateKey.armoredKey;
    this.setupEntity.userPublicArmoredKey = externalGpgKeyPair.publicKey.armoredKey;
    this.setupEntity.passphrase = dto.passphrase;
    this.setupEntity.userKeyFingerprint = publicGpgKeyInfo.fingerprint;
  }
}

exports.RecoverGenerateAccountRecoveryRequestKeyController = RecoverGenerateAccountRecoveryRequestKeyController;
