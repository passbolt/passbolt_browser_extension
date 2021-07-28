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
 * @since         3.4.0
 */

const {ResourceInProgressCacheService} = require("../../service/cache/resourceInProgressCache.service");
const Worker = require('../../model/worker');
const {QuickAccessService} = require("../../service/ui/quickAccess.service");


/**
 * Controller related to the in-form call-to-action
 */
class InformMenuController {
  /**
   * InformMenuController constructor
   * @param {Worker} worker
   * @param {ApiClientOptions} clientOptions
   */
  constructor(worker) {
    this.worker = worker;
  }

  /**
   * Request the initial configuration of the in-form menu
   * @param requestId The identifier of the request
   */
  async getInitialConfiguration(requestId) {
    try {
      const callToActionInput = await Worker.get('WebIntegration', this.worker.tab.id).port.request('passbolt.web-integration.last-performed-call-to-action-input');
      const configuration = {
        inputType: callToActionInput.type,
        inputValue: callToActionInput.value,
        suggestedResources: []
      }
      this.worker.port.emit(requestId, "SUCCESS", configuration);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(requestId, 'ERROR', error);
    }
  }

  /**
   * Whenever the user intends to create a new credentials through the in-fom menu
   * @param requestId The identifier of the request
   */
  async createNewCredentials(requestId) {
    const queryParameters = [
      {name: "uiMode", value: "detached"},
      {name: "feature", value: "create-new-credentials"},
      {name: "tabId", value: this.worker.tab.id}
    ];
    await QuickAccessService.openInDetachedMode(queryParameters);
    Worker.get('WebIntegration', this.worker.tab.id).port.emit('passbolt.in-form-menu.close');
    this.worker.port.emit(requestId, "SUCCESS");
  }

  /**
   * Whenever the user intends to save credentials through the in-fom menu
   * @param requestId The identifier of the request
   */
  async saveCredentials(requestId) {
    const queryParameters = [
      {name: "uiMode", value: "detached"},
      {name: "feature", value: "save-credentials"},
      {name: "tabId", value: this.worker.tab.id}
    ];
    // Request username and password
    const {username, password: secret_clear} = await Worker.get('WebIntegration', this.worker.tab.id).port.request('passbolt.web-integration.get-credentials');
    const resourceInProgress = {username, secret_clear};
    ResourceInProgressCacheService.set(resourceInProgress);
    await QuickAccessService.openInDetachedMode(queryParameters);
    Worker.get('WebIntegration', this.worker.tab.id).port.emit('passbolt.in-form-menu.close');
    this.worker.port.emit(requestId, "SUCCESS");
  }

  /**
   * Whenever the user intends to create a new credentials through the in-fom menu
   * @param requestId The identifier of the request
   */
  async browseCredentials(requestId) {
    const queryParameters = [
      {name: "uiMode", value: "detached"},
      {name: "feature", value: "browse-credentials"},
      {name: "tabId", value: this.worker.tab.id}
    ];
    await QuickAccessService.openInDetachedMode(queryParameters);
    Worker.get('WebIntegration', this.worker.tab.id).port.emit('passbolt.in-form-menu.close');
    this.worker.port.emit(requestId, "SUCCESS");
  }
}


exports.InformMenuController = InformMenuController;
