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

const {SetupEntity} = require("../../model/entity/setup/setupEntity");
const {GenerateGpgKeyPairEntity} = require('../../model/entity/gpgkey/generate/generateGpgKeyPairEntity');
const {GenerateGpgKeyPairService} = require("../../service/crypto/generateGpgKeyPairService");

/**
 * @typedef {({passphrase: string})} GenerateKeyPairPassphraseDto
 */

const DEFAULT_KEY_SIZE = 2048;

class GenerateKeyPairSetupController {
  /**
   * Constructor.
   * @param {Worker} worker The associated worker.
   * @param {string} requestId The associated request id.
   * @param {SetupEntity} setupEntity The associated setup entity.
   */
  constructor(worker, requestId, setupEntity) {
    if (!setupEntity) {
      throw new Error("The setupEntity can't be null");
    }

    if (!(setupEntity instanceof SetupEntity)) {
      throw new Error("the setupEntity must be of type SetupEntity");
    }

    this.worker = worker;
    this.requestId = requestId;
    this.setupEntity = setupEntity;
  }

  /**
   * Controller executor.
   * @param {GenerateKeyPairPassphraseDto} generateGpgKeyDto The meta used to generate the user key
   * @returns {Promise<void>}
   */
  async _exec(generateGpgKeyDto) {
    try {
      await this.exec(generateGpgKeyDto);
      this.worker.port.emit(this.requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Generate a key pair and set it to the setup entity.
   *
   * @param {GenerateKeyPairPassphraseDto} generateGpgKeyDto
   * @returns {Promise<void>}
   */
  async exec(generateGpgKeyDto) {
    const generateGpgKeyPairEntity = GenerateKeyPairSetupController._buildGenerateKeyPairEntity(this.setupEntity.user, generateGpgKeyDto.passphrase);
    const keyPair = await GenerateGpgKeyPairService.generateKeyPair(generateGpgKeyPairEntity);

    this.setupEntity.userPrivateArmoredKey = keyPair.privateKey.armoredKey;
    this.setupEntity.userPublicArmoredKey = keyPair.publicKey.armoredKey;
    // Store the user passphrase to login in after the setup operation.
    this.setupEntity.passphrase = generateGpgKeyDto.passphrase;
  }


  /**
   * Builds a default GenerateGpgKeyPairEntity with the given passphrase.
   *
   * @param {UserEntity} user
   * @param {string} passphrase
   * @returns {GenerateGpgKeyPairEntity}
   * @private
   */
  static _buildGenerateKeyPairEntity(user, passphrase) {
    return new GenerateGpgKeyPairEntity({
      name: `${user.profile.firstName} ${user.profile.lastName}`,
      email: user.username,
      passphrase: passphrase,
      keySize: this.DEFAULT_KEY_SIZE
    });
  }

  static get DEFAULT_KEY_SIZE() {
    return DEFAULT_KEY_SIZE;
  }
}

exports.GenerateKeyPairSetupController = GenerateKeyPairSetupController;
