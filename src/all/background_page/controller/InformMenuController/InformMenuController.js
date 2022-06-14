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
const {PasswordGeneratorModel} = require("../../model/passwordGenerator/passwordGeneratorModel");
const {ResourceModel} = require("../../model/resource/resourceModel");
const {QuickAccessService} = require("../../service/ui/quickAccess.service");
const passphraseController = require('../passphrase/passphraseController');
const {BrowserTabService} = require("../../service/ui/browserTab.service");
const {ExternalResourceEntity} = require("../../model/entity/resource/external/externalResourceEntity");
const {DecryptMessageService} = require('../../service/crypto/decryptMessageService');
const {GetDecryptedUserPrivateKeyService} = require("../../service/account/getDecryptedUserPrivateKeyService");
const {readMessageOrFail} = require("../../utils/openpgp/openpgpAssertions");
const {ResourceEntity} = require("../../model/entity/resource/resourceEntity");
/**
 * Controller related to the in-form call-to-action
 */
class InformMenuController {
  /**
   * InformMenuController constructor
   * @param {Worker} worker
   * @param {ApiClientOptions} clientOptions
   */
  constructor(worker, apiClientOptions) {
    this.worker = worker;
    this.resourceModel = new ResourceModel(apiClientOptions);
    this.apiClientOptions = apiClientOptions;
  }

  /**
   * Request the initial configuration of the in-form menu
   * @param requestId The identifier of the request
   */
  async getInitialConfiguration(requestId) {
    try {
      // Find user input type and value, resources to suggest and secret generator configuration
      const callToActionInput = await Worker.get('WebIntegration', this.worker.tab.id).port.request('passbolt.web-integration.last-performed-call-to-action-input');
      const suggestedResources = await this.resourceModel.findSuggestedResources(this.worker.tab.url);
      const passwordGeneratorModel = new PasswordGeneratorModel(this.apiClientOptions);
      const passwordGenerator = await passwordGeneratorModel.getOrFindAll();
      const generatorConfigurationMatch = generator => generator.type === passwordGenerator.default_generator;
      const passwordGeneratorConfiguration = passwordGenerator.generators.find(generatorConfigurationMatch);
      const configuration = {
        inputType: callToActionInput.type,
        inputValue: callToActionInput.value,
        suggestedResources: suggestedResources,
        secretGeneratorConfiguration: passwordGeneratorConfiguration
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
    Worker.get('WebIntegration', this.worker.tab.id).port.emit('passbolt.in-form-menu.close');
    this.worker.port.emit(requestId, "SUCCESS");
  }

  /**
   * Whenever the user intends to save credentials through the in-fom menu
   * @param requestId The identifier of the request
   */
  async saveCredentials(requestId) {
    // Request resource username and password to the page on which the save credentials has been initiated.
    const {username, password: secret_clear} = await Worker.get('WebIntegration', this.worker.tab.id).port.request('passbolt.web-integration.get-credentials');

    // Retrieve resource name and uri from tab.
    const tab = await BrowserTabService.getCurrent();
    const name = tab.title;
    const uri = tab.url.substr(0, ResourceEntity.URI_MAX_LENGTH);

    // Store the resource to save in cache.
    const resourceDto = {name: name, username: username, uri: uri, secret_clear: secret_clear};
    const resource = new ExternalResourceEntity(resourceDto);
    ResourceInProgressCacheService.set(resource);

    // Open the quickaccess on the save credentials page.
    const quickaccessDetachModeQueryParameters = [
      {name: "uiMode", value: "detached"},
      {name: "feature", value: "save-credentials"},
      {name: "tabId", value: this.worker.tab.id}
    ];
    await QuickAccessService.openInDetachedMode(quickaccessDetachModeQueryParameters);

    this.worker.port.emit(requestId, "SUCCESS");
    Worker.get('WebIntegration', this.worker.tab.id).port.emit('passbolt.in-form-menu.close');
  }

  /**
   * Whenever the user intends to use a suggested resource as credentials for the current page
   * @param requestId A request identifier
   * @param resourceId A resource identifier
   * @return {Promise<void>}
   */
  async useSuggestedResource(requestId, resourceId) {
    // WebIntegration Worker
    const webIntegrationWorker = Worker.get('WebIntegration', this.worker.tab.id);
    try {
      // Get the resource, decrypt the resources password and requests to fill the credentials
      const passphrase = await passphraseController.requestFromQuickAccess();
      const resource = await this.resourceModel.findForDecrypt(resourceId);
      const privateKey = await GetDecryptedUserPrivateKeyService.getKey(passphrase);
      const resourceSecretMessage = await readMessageOrFail(resource.secret.data);
      let plaintext = await DecryptMessageService.decrypt(resourceSecretMessage, privateKey);
      plaintext = await this.resourceModel.deserializePlaintext(resource.resourceTypeId, plaintext);
      const {username} = resource;
      const password = plaintext?.password || plaintext;
      webIntegrationWorker.port.emit('passbolt.web-integration.fill-credentials', {username: username, password: password});
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
    Worker.get('WebIntegration', this.worker.tab.id).port.emit('passbolt.in-form-menu.close');
    this.worker.port.emit(requestId, "SUCCESS");
  }

  /**
   * Whenever the user intends to fille a password field in the current page
   */
  fillPassword(requestId, password) {
    Worker.get('WebIntegration', this.worker.tab.id).port.emit('passbolt.web-integration.fill-password', password);
    this.worker.port.emit(requestId, "SUCCESS");
  }

  /**
   * Whenever the user intends to close the in-form-menu in the current page
   */
  close(requestId) {
    Worker.get('WebIntegration', this.worker.tab.id).port.emit('passbolt.in-form-menu.close');
    this.worker.port.emit(requestId, "SUCCESS");
  }
}


exports.InformMenuController = InformMenuController;
