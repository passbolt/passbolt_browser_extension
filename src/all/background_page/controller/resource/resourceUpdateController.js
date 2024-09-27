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
 * @since         2.13.0
 */
import Keyring from "../../model/keyring";
import GetPassphraseService from "../../service/passphrase/getPassphraseService";
import UserModel from "../../model/user/userModel";
import i18n from "../../sdk/i18n";
import ProgressService from "../../service/progress/progressService";
import ResourceUpdateService from "../../service/resource/update/resourceUpdateService";

class ResourceUpdateController {
  /**
   * ResourceUpdateController constructor
   *
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions the api client options
   * @param {AccountEntity} account The account associated to the worker.clientOptions
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.userModel = new UserModel(apiClientOptions);
    this.keyring = new Keyring();
    this.progressService = new ProgressService(this.worker, i18n.t("Updating password"));
    this.getPassphraseService = new GetPassphraseService(account);
    this.resourceUpdateService = new ResourceUpdateService(account, apiClientOptions, this.progressService);
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
   * Update a resource.
   *
   * @param {object} resourceDto The resource data
   * @param {null|string|object} plaintextDto The secret to encrypt
   * @returns {Promise<Object>} updated resource
   */
  async exec(resourceDto, plaintextDto) {
    try {
      const passphrase = await this.getPassphraseService.getPassphrase(this.worker);
      this.progressService.start(1, i18n.t('Updating resource'));
      const resourceUpdated =  await this.resourceUpdateService.exec(resourceDto, plaintextDto, passphrase);
      await this.progressService.finishStep(i18n.t('Done!'), true);
      return resourceUpdated;
    } finally {
      await this.progressService.close();
    }
  }
}

export default ResourceUpdateController;
