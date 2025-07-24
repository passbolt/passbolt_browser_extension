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

import ResourceModel from "../../model/resource/resourceModel";
import {QuickAccessService} from "../../service/ui/quickAccess.service";
import GetPassphraseService from "../../service/passphrase/getPassphraseService";
import BrowserTabService from "../../service/ui/browserTab.service";
import ExternalResourceEntity from "../../model/entity/resource/external/externalResourceEntity";
import ResourceInProgressCacheService from "../../service/cache/resourceInProgressCache.service";
import WorkerService from "../../service/worker/workerService";
import ResourceTypeModel from "../../model/resourceType/resourceTypeModel";
import ResourceMetadataEntity from "passbolt-styleguide/src/shared/models/entity/resource/metadata/resourceMetadataEntity";
import GetOrFindResourcesService from "../../service/resource/getOrFindResourcesService";

/**
 * Controller related to the in-form call-to-action
 */
class InformMenuController {
  /**
   * InformMenuController constructor
   * @param {Worker} worker
   * @param {ApiClientOptions} apiClientOptions the api client options
   * @param {AccountEntity} account the account associated to the worker
   */
  constructor(worker, apiClientOptions, account) {
    this.worker = worker;
    this.resourceModel = new ResourceModel(apiClientOptions, account);
    this.resourceTypeModel = new ResourceTypeModel(apiClientOptions);
    this.getPassphraseService = new GetPassphraseService(account);
    this.getOrFindResourcesService = new GetOrFindResourcesService(account, apiClientOptions);
  }

  /**
   * Request the initial configuration of the in-form menu
   * @param requestId The identifier of the request
   */
  async getInitialConfiguration(requestId) {
    try {
      // Find user input type and value, resources to suggest and secret generator configuration
      const webIntegrationWorker = await WorkerService.get('WebIntegration', this.worker.tab.id);
      const callToActionInput = await webIntegrationWorker.port.request('passbolt.web-integration.last-performed-call-to-action-input');
      const suggestedResources = await this.getOrFindResourcesService.getOrFindSuggested(this.worker.tab.url);
      const configuration = {
        inputType: callToActionInput.type,
        inputValue: callToActionInput.value,
        suggestedResources: suggestedResources.toDto(),
      };
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
    const webIntegrationWorker = await WorkerService.get('WebIntegration', this.worker.tab.id);
    webIntegrationWorker.port.emit('passbolt.in-form-menu.close');
    this.worker.port.emit(requestId, "SUCCESS");
  }

  /**
   * Whenever the user intends to save credentials through the in-fom menu
   * @param requestId The identifier of the request
   */
  async saveCredentials(requestId) {
    // Request resource username and password to the page on which the save credentials has been initiated.
    const webIntegrationWorker = await WorkerService.get('WebIntegration', this.worker.tab.id);
    const {username, password: secret_clear} = await webIntegrationWorker.port.request('passbolt.web-integration.get-credentials');

    // Retrieve resource name and uris from tab.
    const tab = await BrowserTabService.getCurrent();
    const name = tab.title;
    const uris = [tab.url.substr(0, ResourceMetadataEntity.URI_MAX_LENGTH)];

    // Store the resource to save in cache.
    const resourceDto = {name: name, username: username, uris: uris, secret_clear: secret_clear};
    const resource = new ExternalResourceEntity(resourceDto);
    await ResourceInProgressCacheService.set(resource);

    // Open the quickaccess on the save credentials page.
    const quickaccessDetachModeQueryParameters = [
      {name: "uiMode", value: "detached"},
      {name: "feature", value: "save-credentials"},
      {name: "tabId", value: this.worker.tab.id}
    ];
    await QuickAccessService.openInDetachedMode(quickaccessDetachModeQueryParameters);

    this.worker.port.emit(requestId, "SUCCESS");
    webIntegrationWorker.port.emit('passbolt.in-form-menu.close');
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
    const webIntegrationWorker = await WorkerService.get('WebIntegration', this.worker.tab.id);
    webIntegrationWorker.port.emit('passbolt.in-form-menu.close');
    this.worker.port.emit(requestId, "SUCCESS");
  }

  /**
   * Whenever the user intends to fille a password field in the current page
   */
  async fillPassword(requestId, password) {
    const webIntegrationWorker = await WorkerService.get('WebIntegration', this.worker.tab.id);
    webIntegrationWorker.port.emit('passbolt.web-integration.fill-password', password);
    this.worker.port.emit(requestId, "SUCCESS");
  }

  /**
   * Whenever the user intends to close the in-form-menu in the current page
   */
  async close(requestId) {
    const webIntegrationWorker = await WorkerService.get('WebIntegration', this.worker.tab.id);
    webIntegrationWorker.port.emit('passbolt.in-form-menu.close');
    this.worker.port.emit(requestId, "SUCCESS");
  }
}


export default InformMenuController;
