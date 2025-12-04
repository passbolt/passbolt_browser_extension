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
 * @since         4.6.0
 */

import ResourceModel from "../../model/resource/resourceModel";
import ResourceTypeModel from "../../model/resourceType/resourceTypeModel";
import GetPassphraseService from "../../service/passphrase/getPassphraseService";
import WorkerService from "../../service/worker/workerService";
import GetDecryptedUserPrivateKeyService from "../../service/account/getDecryptedUserPrivateKeyService";
import DecryptAndParseResourceSecretService from "../../service/secret/decryptAndParseResourceSecretService";
import InformMenuPagemod from "../../pagemod/informMenuPagemod";
import QuickAccessPagemod from "../../pagemod/quickAccessPagemod";
import FindSecretService from "../../service/secret/findSecretService";
import TotpService from "../../service/otp/totpService";
import CopyToClipboardService from "../../service/clipboard/copyToClipboardService";

class AutofillController {
  /**
   * AutofillController constructor
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions the api client options
   * @param {AccountEntity} account The account associated to the worker.
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.resourceModel = new ResourceModel(apiClientOptions, account);
    this.findSecretService = new FindSecretService(account, apiClientOptions);
    this.resourceTypeModel = new ResourceTypeModel(apiClientOptions);
    this.getPassphraseService = new GetPassphraseService(account);
  }

  /**
   * Whenever the user intends to use a suggested resource as credentials for the current page
   * @param resourceId A resource identifier
   * @param tabId A tab identifier
   * @return {Promise<void>}
   */
  async _exec(resourceId, tabId) {
    try {
      await this.exec(resourceId, tabId);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Autofill credential
   *
   * @param resourceId {string} A resource identifier
   * @param tabId {string} A tab identifier
   * @return {Promise<void>} The credential.
   */
  async exec(resourceId, tabId) {
    // WebIntegration Worker
    const webIntegrationWorker = await WorkerService.get('WebIntegration', tabId);
    try {
      const passphrase = await this.getPassphrase();
      // Get the resource, decrypt the resources password and requests to fill the credentials
      const resource = await this.resourceModel.getById(resourceId);
      const secret = await this.findSecretService.findByResourceId(resourceId);
      const secretSchema = await this.resourceTypeModel.getSecretSchemaById(resource.resourceTypeId);
      const privateKey = await GetDecryptedUserPrivateKeyService.getKey(passphrase);
      const plaintextSecret = await DecryptAndParseResourceSecretService.decryptAndParse(secret, secretSchema, privateKey);
      const username = resource.metadata?.username || "";
      const password = plaintextSecret?.password;
      this.fillCredential(webIntegrationWorker, {username, password});
      // Copy TOTP to clipboard if available
      await this.copyTotpToClipboard(plaintextSecret?.totp);
    } finally {
      if (this.isInformMenuWorker) {
        webIntegrationWorker.port.emit('passbolt.in-form-menu.close');
      }
    }
  }

  /**
   * Is the inform menu worker
   * @private
   * @return {boolean}
   */
  get isInformMenuWorker() {
    return this.worker.name === InformMenuPagemod.appName;
  }

  /**
   * Is the quick access worker
   * @private
   * @return {boolean}
   */
  get isQuickAccessWorker() {
    return this.worker.name === QuickAccessPagemod.appName;
  }

  /**
   * Get the passphrase
   * @private
   * @return {Promise<string>}
   */
  async getPassphrase() {
    if (this.isInformMenuWorker) {
      // Get the passphrase from the quickaccess in detached mode if not stored in memory
      return await this.getPassphraseService.requestPassphraseFromQuickAccess();
    } else {
      // Get the passphrase from the worker (should be the quickacess already opened) if not stored in memory
      return await this.getPassphraseService.getPassphrase(this.worker);
    }
  }

  /**
   * Fill the credential
   * @private
   * @param {Worker} webIntegrationWorker
   * @param {Object} credential
   */
  fillCredential(webIntegrationWorker, credential) {
    // TODO Should use the same method to autofill in the future
    if (this.isInformMenuWorker) {
      webIntegrationWorker.port.emit('passbolt.web-integration.fill-credentials', credential);
    } else if (this.isQuickAccessWorker) {
      // Get the url from the worker port to have the tab url for the quickaccess
      const url = webIntegrationWorker.port._port.sender.url;
      webIntegrationWorker.port.request('passbolt.quickaccess.fill-form', credential.username, credential.password, url);
    }
  }

  /**
   * Copy TOTP code to clipboard if the resource has TOTP configured.
   * @private
   * @param {Object|null} totp - The TOTP configuration from the decrypted secret
   * @return {Promise<void>}
   */
  async copyTotpToClipboard(totp) {
    if (!totp) {
      return;
    }
    try {
      const totpCode = TotpService.generate(totp);
      const clipboardService = new CopyToClipboardService();
      await clipboardService.copyTemporarily(totpCode);
    } catch (error) {
      // Log but don't fail the autofill operation if TOTP copy fails
      console.error("Failed to copy TOTP to clipboard:", error);
    }
  }
}

export default AutofillController;
