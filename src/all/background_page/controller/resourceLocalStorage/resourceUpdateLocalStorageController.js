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
 * @since         4.9.4
 */
import UserPassphraseRequiredError from "passbolt-styleguide/src/shared/error/userPassphraseRequiredError";
import FindAndUpdateResourcesLocalStorage from "../../service/resource/findAndUpdateResourcesLocalStorageService";
import GetPassphraseService from "../../service/passphrase/getPassphraseService";
import PassphraseStorageService from "../../service/session_storage/passphraseStorageService";

class ResourceUpdateLocalStorageController {
  /**
   * ResourceUpdateLocalStorageController constructor
   *
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions the api client options
   * @param {AccountEntity} account The account associated to the worker.clientOptions
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.findAndUpdateResourcesLocalStorage = new FindAndUpdateResourcesLocalStorage(account, apiClientOptions);
    this.getPassphraseService = new GetPassphraseService(account);
  }

  /**
   * Controller executor.
   * @param {{updatePeriodThreshold: number}} options The options
   * @param {number} options.updatePeriodThreshold Do not update the local storage if the threshold is not overdue.
   * @returns {Promise<void>}
   */
  async _exec(options = {}) {
    try {
      await this.exec(options);
      this.worker.port.emit(this.requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Update the resource local storage.
   * @returns {Promise<Object>} updated resource
   */
  async exec() {
    try {
      /**
       * Try to fetch the resources.
       * If the user passphrase is required but not in sessionStorage, prompt the user. The passphrase is needed when:
       * 1. the metadata could be decrypted with a metadata session key, but the session keys are themselves encrypted;
       * 2. the metadata is encrypted with the shared‑metadata key, but this one is not yet decrypted in the session storage;
       * 3. the metadata is encrypted with the user’s private key.
       */
      await this.findAndUpdateResourcesLocalStorage.findAndUpdateAll({updatePeriodThreshold: 10000});
    } catch (error) {
      if (!(error instanceof UserPassphraseRequiredError)) {
        throw error;
      }
      const passphrase =  await this.getPassphraseService.getPassphrase(this.worker);
      await PassphraseStorageService.set(passphrase, 60);
      await this.findAndUpdateResourcesLocalStorage.findAndUpdateAll();
    }
  }
}

export default ResourceUpdateLocalStorageController;
