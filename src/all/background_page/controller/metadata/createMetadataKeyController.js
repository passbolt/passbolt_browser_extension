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
 * @since         4.11.0
 */

import GetPassphraseService from "../../service/passphrase/getPassphraseService";
import CreateMetadataKeyService from "../../service/metadata/createMetadataKeyService";
import ExternalGpgKeyPairEntity
  from "passbolt-styleguide/src/shared/models/entity/gpgkey/external/externalGpgKeyPairEntity";

class CreateMetadataKeyController {
  /**
   * @constructor
   * @param {Worker} worker
   * @param {string} requestId
   * @param {AccountEntity} account the user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(worker, requestId, account, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.getPassphraseService = new GetPassphraseService(account);
    this.createMetadataKeyService = new CreateMetadataKeyService(account, apiClientOptions);
  }

  /**
   * Controller executor.
   * @returns {Promise<void>}
   */
  async _exec() {
    try {
      const result = await this.exec.apply(this, arguments);
      this.worker.port.emit(this.requestId, 'SUCCESS', result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Create a metadata key.
   * @param {object} metadataKeyPairDto The metadata key pair dto.
   * @returns {Promise<MetadataKeyEntity>}
   * @throws {TypeError} If the metadataKeyPair is not a valid key pair entity.
   */
  async exec(metadataKeyPairDto) {
    const metadataKeyPair = new ExternalGpgKeyPairEntity(metadataKeyPairDto);
    const passphrase = await this.getPassphraseService.getPassphrase(this.worker);
    return this.createMetadataKeyService.create(metadataKeyPair, passphrase);
  }
}

export default CreateMetadataKeyController;
