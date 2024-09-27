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
import FindAndUpdateResourcesLocalStorage from "../../service/resource/findAndUpdateResourcesLocalStorageService";

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
   * @param {{updatePeriodThreshold: number}} options The options
   * @param {number} options.updatePeriodThreshold Do not update the local storage if the threshold is not overdue.
   * @returns {Promise<Object>} updated resource
   */
  async exec(options = {}) {
    await this.findAndUpdateResourcesLocalStorage.findAndUpdateAll(options);
  }
}

export default ResourceUpdateLocalStorageController;
