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

import GenerateMetadataKeyService from "../../service/metadata/generateMetadataKeyService";
import GetPassphraseService from "../../service/passphrase/getPassphraseService";

class GenerateMetadataPrivateKeyController {
  /**
   * @constructor
   * @param {Worker} worker
   * @param {string} requestId
   * @param {AccountEntity} account the user account
   */
  constructor(worker, requestId, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.getPassphraseService = new GetPassphraseService(account);
    this.generateMetadataKeyService = new GenerateMetadataKeyService(account);
  }

  /**
   * Controller executor.
   * @returns {Promise<void>}
   */
  async _exec() {
    try {
      const result = await this.exec();
      this.worker.port.emit(this.requestId, 'SUCCESS', result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Generate a metadata key.
   * @returns {Promise<ExternalGpgKeyPairEntity>}
   */
  async exec() {
    const passphrase = await this.getPassphraseService.getPassphrase(this.worker);
    return this.generateMetadataKeyService.generateKey(passphrase);
  }
}

export default GenerateMetadataPrivateKeyController;
