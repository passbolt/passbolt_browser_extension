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

const {GenerateGpgKeyPairOptionsEntity} = require("../../model/entity/gpgkey/generate/generateGpgKeyPairOptionsEntity");
const {GenerateGpgKeyPairService} = require("../../service/crypto/generateGpgKeyPairService");
const {GetGpgKeyCreationDateService} = require("../../service/crypto/getGpgKeyCreationDateService");
const {readKeyOrFail} = require("../../utils/openpgp/openpgpAssertions");

const ACCOUNT_RECOVERY_REQUEST_KEY_SIZE = 4096;

class GenerateRecoverAccountRecoveryRequestKeyController {
  /**
   * Constructor.
   * @param {Worker} worker The associated worker.
   * @param {string} requestId The associated request id.
   * @param {AccountRecoverEntity} account The account being recovered.
   */
  constructor(worker, requestId, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.account = account;
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
      email: this.account?.username,
      passphrase: generateGpgKeyPairDto?.passphrase,
      keySize: ACCOUNT_RECOVERY_REQUEST_KEY_SIZE,
      date: await GetGpgKeyCreationDateService.getDate(),
    };
    const generateGpgKeyPairOptionsEntity = new GenerateGpgKeyPairOptionsEntity(dto);
    const externalGpgKeyPair = await GenerateGpgKeyPairService.generateKeyPair(generateGpgKeyPairOptionsEntity);
    const generatedPublicKey = await readKeyOrFail(externalGpgKeyPair.publicKey.armoredKey);
    this.account.userPrivateArmoredKey = externalGpgKeyPair.privateKey.armoredKey;
    this.account.userPublicArmoredKey = externalGpgKeyPair.publicKey.armoredKey;
    this.account.userKeyFingerprint = generatedPublicKey.getFingerprint().toUpperCase();
  }
}

exports.GenerateRecoverAccountRecoveryRequestKeyController = GenerateRecoverAccountRecoveryRequestKeyController;
