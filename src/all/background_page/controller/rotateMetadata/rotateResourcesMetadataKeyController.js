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
 * @since         5.6.0
 */

import GetPassphraseService from "../../service/passphrase/getPassphraseService";
import ProgressService from "../../service/progress/progressService";
import i18n from "../../sdk/i18n";
import RotateResourcesMetadataKeyService from "../../service/metadata/rotateMetadata/rotateResourcesMetadataKeyService";

export default class RotateResourcesMetadataKeyController {
  /**
   * @constructor
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions The api client options
   * @param {AccountEntity} account The user account
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.progressService = new ProgressService(worker, "Rotating metadata");
    this.rotateResourcesMetadataKeyService = new RotateResourcesMetadataKeyService(account, apiClientOptions, this.progressService);
    this.getPassphraseService = new GetPassphraseService(account);
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
   * Run the metadata rotation process.
   * @returns {Promise<void>}
   */
  async exec() {
    const replayOptions = {count: 0};
    const passphrase = await this.getPassphraseService.getPassphrase(this.worker);
    // Start with a goal high enough to update it in the service as the number of resources page is unknown yet.
    this.progressService.start(10, i18n.t("Rotating metadata"));

    try {
      await this.rotateResourcesMetadataKeyService.rotate(passphrase, replayOptions);
      this.progressService.finishStep(i18n.t("Done"));
    } finally {
      this.progressService.close();
    }
  }
}
