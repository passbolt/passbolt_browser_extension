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

import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import GetGpgKeyCreationDateService from "../../service/crypto/getGpgKeyCreationDateService";
import GenerateGpgKeyPairOptionsEntity from "../../model/entity/gpgkey/generate/generateGpgKeyPairOptionsEntity";
import GenerateGpgKeyPairService from "../../service/crypto/generateGpgKeyPairService";
import AccountTemporarySessionStorageService from "../../service/sessionStorage/accountTemporarySessionStorageService";
import FindAccountTemporaryService from "../../service/account/findAccountTemporaryService";

const ACCOUNT_RECOVERY_REQUEST_KEY_SIZE = 4096;

class GenerateRecoverAccountRecoveryRequestKeyController {
  /**
   * Constructor.
   * @param {Worker} worker The associated worker.
   * @param {string} requestId The associated request id.
   * @param {ApiClientOptions} apiClientOptions The api client options.
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.apiClientOptions = apiClientOptions;
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
    const temporaryAccount = await FindAccountTemporaryService.exec(this.worker.port._port.name);
    const dto = {
      name: 'Account recovery request key',
      email: temporaryAccount.account?.username,
      passphrase: generateGpgKeyPairDto?.passphrase,
      keySize: ACCOUNT_RECOVERY_REQUEST_KEY_SIZE,
      date: await GetGpgKeyCreationDateService.getDate(this.apiClientOptions),
    };
    const generateGpgKeyPairOptionsEntity = new GenerateGpgKeyPairOptionsEntity(dto);
    const externalGpgKeyPair = await GenerateGpgKeyPairService.generateKeyPair(generateGpgKeyPairOptionsEntity);
    const generatedPublicKey = await OpenpgpAssertion.readKeyOrFail(externalGpgKeyPair.publicKey.armoredKey);
    temporaryAccount.account.userPrivateArmoredKey = externalGpgKeyPair.privateKey.armoredKey;
    temporaryAccount.account.userPublicArmoredKey = externalGpgKeyPair.publicKey.armoredKey;
    temporaryAccount.account.userKeyFingerprint = generatedPublicKey.getFingerprint().toUpperCase();
    // Update all data in the temporary account stored
    await AccountTemporarySessionStorageService.set(temporaryAccount);
  }
}

export default GenerateRecoverAccountRecoveryRequestKeyController;
