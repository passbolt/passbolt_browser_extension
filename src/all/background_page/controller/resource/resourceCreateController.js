/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.9.0
 */

import i18n from "../../sdk/i18n";
import GetPassphraseService from "../../service/passphrase/getPassphraseService";
import ProgressService from "../../service/progress/progressService";
import ResourceCreateService from "../../service/resource/create/resourceCreateService";
import VerifyOrTrustMetadataKeyService from "../../service/metadata/verifyOrTrustMetadataKeyService";

class ResourceCreateController {
  /**
   * ResourceCreateController constructor
   *
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions the api client options
   * @param {AccountEntity} account The account associated to the worker.
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.progressService = new ProgressService(this.worker, i18n.t('Creating password'));
    this.resourceCreateService = new ResourceCreateService(account, apiClientOptions, this.progressService);
    this.getPassphraseService = new GetPassphraseService(account);
    this.verifyOrTrustMetadataKeyService = new VerifyOrTrustMetadataKeyService(worker, account, apiClientOptions);
  }

  /**
   * Controller executor.
   * @param {object} resourceDto The resource data
   * @param {string|object} plaintextDto The secret to encrypt
   * @returns {Promise<void>}
   */
  async _exec(resourceDto, plaintextDto) {
    try {
      const resource = await this.exec(resourceDto, plaintextDto);
      this.worker.port.emit(this.requestId, 'SUCCESS', resource);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * @param {object} resourceDto The resource data
   * @param {string|object} plaintextDto The secret to encrypt
   * @returns {Promise<void>}
   */
  async exec(resourceDto, plaintextDto) {
    const goals = resourceDto.folder_parent_id ? 10 : 3;
    const passphrase = await this.getPassphraseService.getPassphrase(this.worker);
    await this.verifyOrTrustMetadataKeyService.verifyTrustedOrTrustNewMetadataKey(passphrase);
    this.progressService.start(goals, i18n.t('Initializing'));

    try {
      const resourceCreated =  await this.resourceCreateService.create(resourceDto, plaintextDto, passphrase);
      await this.progressService.finishStep(i18n.t('Done!'), true);
      return resourceCreated;
    } finally {
      await this.progressService.close();
    }
  }
}

export default ResourceCreateController;
