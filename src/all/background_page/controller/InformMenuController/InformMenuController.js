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
import GetDecryptedUserPrivateKeyService from "../../service/account/getDecryptedUserPrivateKeyService";
import BrowserTabService from "../../service/ui/browserTab.service";
import ResourceEntity from "../../model/entity/resource/resourceEntity";
import ExternalResourceEntity from "../../model/entity/resource/external/externalResourceEntity";
import ResourceInProgressCacheService from "../../service/cache/resourceInProgressCache.service";
import WorkerService from "../../service/worker/workerService";
import DecryptAndParseResourceSecretService from "../../service/secret/decryptAndParseResourceSecretService";
import ResourceTypeModel from "../../model/resourceType/resourceTypeModel";

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
      const suggestedResources = await this.resourceModel.findSuggestedResources(this.worker.tab.url);
      const configuration = {
        inputType: callToActionInput.type,
        inputValue: callToActionInput.value,
        suggestedResources: suggestedResources,
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

    // Retrieve resource name and uri from tab.
    const tab = await BrowserTabService.getCurrent();
    const name = tab.title;
    const uri = tab.url.substr(0, ResourceEntity.URI_MAX_LENGTH);

    // Store the resource to save in cache.
    const resourceDto = {name: name, username: username, uri: uri, secret_clear: secret_clear};
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
   * Whenever the user intends to use a suggested resource as credentials for the current page
   * @param requestId A request identifier
   * @param resourceId A resource identifier
   * @return {Promise<void>}
   */
  async useSuggestedResource(requestId, resourceId) {
    // WebIntegration Worker
    const webIntegrationWorker = await WorkerService.get('WebIntegration', this.worker.tab.id);
    try {
      // Get the resource, decrypt the resources password and requests to fill the credentials
      const passphrase = await this.getPassphraseService.requestPassphraseFromQuickAccess();
      const resource = await this.resourceModel.findForDecrypt(resourceId);
      const privateKey = await GetDecryptedUserPrivateKeyService.getKey(passphrase);
      const secretSchema = await this.resourceTypeModel.getSecretSchemaById(resource.resourceTypeId);
      const plaintextSecret = await DecryptAndParseResourceSecretService.decryptAndParse(resource.secret, secretSchema, privateKey);
      const {username} = resource;
      const password = plaintextSecret?.password;
      webIntegrationWorker.port.emit('passbolt.web-integration.fill-credentials', {username, password});
      this.worker.port.emit(requestId, "SUCCESS");
      webIntegrationWorker.port.emit('passbolt.in-form-menu.close');
    } catch (error) {
      // The original worker has been destroyed when requesting to close the in-form menu, there is no worker to notify.
      console.error(error);
      this.worker.port.emit(requestId, "ERROR", error);
      webIntegrationWorker.port.emit('passbolt.in-form-menu.close');
    }
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
