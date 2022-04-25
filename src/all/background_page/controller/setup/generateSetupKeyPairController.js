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

const {GenerateGpgKeyPairEntity} = require('../../model/entity/gpgkey/generate/generateGpgKeyPairEntity');
const {GenerateGpgKeyPairService} = require("../../service/crypto/generateGpgKeyPairService");
const {GetGpgKeyInfoService} = require("../../service/crypto/getGpgKeyInfoService");

/**
 * @typedef {({passphrase: string})} GenerateKeyPairPassphraseDto
 */

const DEFAULT_KEY_SIZE = 3072;

class GenerateSetupKeyPairController {
  /**
   * Constructor.
   * @param {Worker} worker The associated worker.
   * @param {string} requestId The associated request id.
   * @param {AccountSetupEntity} account The account being setup.
   */
  constructor(worker, requestId, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.account = account;
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
   * Generate a key pair and associate to the account being set up.
   *
   * @param {GenerateKeyPairPassphraseDto} generateGpgKeyDto
   * @returns {Promise<void>}
   */
  async exec(generateGpgKeyDto) {
    const generateGpgKeyPairEntity = this._buildGenerateKeyPairEntity(generateGpgKeyDto.passphrase);
    const keyPair = await GenerateGpgKeyPairService.generateKeyPair(generateGpgKeyPairEntity);
    const keyInfo = await GetGpgKeyInfoService.getKeyInfo(keyPair.publicKey.armoredKey);

    this.account.userKeyFingerprint = keyInfo.fingerprint;
    this.account.userPrivateArmoredKey = keyPair.privateKey.armoredKey;
    this.account.userPublicArmoredKey = keyPair.publicKey.armoredKey;
  }

  /**
   * Builds a default GenerateGpgKeyPairEntity with the given passphrase.
   *
   * @param {string} passphrase The passphrase used to protect the key.
   * @returns {GenerateGpgKeyPairEntity}
   * @throw {EntityValidationError} if the generate key pair entity cannot be created with the given data.
   * @private
   */
  _buildGenerateKeyPairEntity(passphrase) {
    return new GenerateGpgKeyPairEntity({
      name: `${this.account.firstName} ${this.account.lastName}`,
      email: this.account.username,
      passphrase: passphrase,
      keySize: DEFAULT_KEY_SIZE
    });
  }
}

exports.GenerateSetupKeyPairController = GenerateSetupKeyPairController;
