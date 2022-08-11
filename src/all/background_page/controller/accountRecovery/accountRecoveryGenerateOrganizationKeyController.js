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
import GetGpgKeyCreationDateService from "../../service/crypto/getGpgKeyCreationDateService";
import GenerateGpgKeyPairOptionsEntity from "../../model/entity/gpgkey/generate/generateGpgKeyPairOptionsEntity";
import GenerateGpgKeyPairService from "../../service/crypto/generateGpgKeyPairService";

/**
 * The account recovery organization key size.
 * @type {number}
 */
const ACCOUNT_RECOVERY_ORGANIZATION_KEY_SIZE = 4096;

/**
 * Controller related to the generation of the account recovery organization key
 */
class AccountRecoveryGenerateOrganizationKeyController {
  /**
   * AccountRecoveryGenerateKeyPairController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
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
      const keyPairEntity = await this.exec(generateGpgKeyPairDto);
      this.worker.port.emit(this.requestId, "SUCCESS", keyPairEntity);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Generate an account recovery organization gpg key.
   * @param {Object} generateGpgKeyPairOptionsDto The account recovery organization key pair dto
   * @returns {Promise<ExternalGpgKeyPairEntity>}
   */
  async exec(generateGpgKeyPairOptionsDto = {}) {
    // Enforce the key size & type.
    const enforcedGenerateGpgKeyPairOptionsDto = {
      type: GenerateGpgKeyPairOptionsEntity.TYPE_RSA,
      keySize: ACCOUNT_RECOVERY_ORGANIZATION_KEY_SIZE,
      date: await GetGpgKeyCreationDateService.getDate(this.apiClientOptions),
    };
    Object.assign(generateGpgKeyPairOptionsDto, enforcedGenerateGpgKeyPairOptionsDto);
    const generateKeyPairOptions = new GenerateGpgKeyPairOptionsEntity(generateGpgKeyPairOptionsDto);
    return GenerateGpgKeyPairService.generateKeyPair(generateKeyPairOptions);
  }
}

export default AccountRecoveryGenerateOrganizationKeyController;
