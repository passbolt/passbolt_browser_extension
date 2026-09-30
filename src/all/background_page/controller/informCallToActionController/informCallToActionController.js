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
 * @since         3.3.0
 */
import ResourceModel from "../../model/resource/resourceModel";
import { QuickAccessService } from "../../service/ui/quickAccess.service";
import WorkerService from "../../service/worker/workerService";
import GetOrFindResourcesService from "../../service/resource/getOrFindResourcesService";
import GetOrFindOfflineResourcesService from "../../service/resource/getOrFindOfflineResourcesService";
import OpenTrustedDomainTabService from "../../service/ui/openTrustedDomainTabService";
import GetOrFindActiveSessionService from "../../service/activeSession/getOrFindActiveSessionService";

/**
 * Controller related to the in-form call-to-action
 */
class InformCallToActionController {
  /**
   * InformCallToActionController constructor
   * @param {Worker} worker
   * @param {ApiClientOptions} apiClientOptions
   * @param {AccountEntity} account the user account
   */
  constructor(worker, apiClientOptions, account) {
    this.worker = worker;
    this.account = account;
    this.apiClientOptions = apiClientOptions;
    this.resourceModel = new ResourceModel(apiClientOptions, account);
    this.getOrFindActiveSessionService = new GetOrFindActiveSessionService(account, apiClientOptions);
    this.openTrustedDomainTabService = new OpenTrustedDomainTabService();
  }

  /**
   * Returns the get or find resources service matching the type of the active session.
   * @returns {Promise<GetOrFindResourcesService|GetOrFindOfflineResourcesService>}
   * @private
   */
  async _getOrFindResourcesService() {
    const activeSession = await this.getOrFindActiveSessionService.getOrFind();

    return activeSession.isSessionOnline
      ? new GetOrFindResourcesService(this.account, this.apiClientOptions)
      : new GetOrFindOfflineResourcesService(this.account, this.apiClientOptions);
  }

  /**
   * Whenever one intends to know the count of suggested resources
   * @param {string} requestId The identifier of the request
   * @param {"username"|"password"|"otp"} fieldType The type of field requesting the count
   */
  async getSuggestedResourcesCount(requestId, fieldType) {
    try {
      const getOrFindResourcesService = await this._getOrFindResourcesService();
      const suggestedResources = await getOrFindResourcesService.getOrFindSuggested(this.worker.tab.url, fieldType);
      this.worker.port.emit(requestId, "SUCCESS", suggestedResources.length);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(requestId, "ERROR", error);
    }
  }

  /**
   * Whenever the user executes the inform call-to-action
   * @param requestId The identifier of the request
   * @param applicationId {uuid} The identifier of the call-to-action that was clicked, so the web
   *   integration can tell which field the menu belongs to without inferring it from focus or hover.
   */
  async execute(requestId, applicationId) {
    try {
      const status = await this.getOrFindActiveSessionService.getOrFind();
      if (!status.isAuthenticated) {
        const queryParameters = [{ name: "feature", value: "login" }];
        await QuickAccessService.open(queryParameters);
        this.worker.port.emit(requestId, "SUCCESS");
      } else if (status.isSessionOnline && status.isServerReachable === false) {
        /*
         * The session is still online but the server cannot be reached, the menu actions would all fail. Hand
         * over to the quickaccess, which bootstraps on its server unavailable screen and offers to sign out
         * locally or to switch to an offline session.
         */
        await QuickAccessService.open();
        this.worker.port.emit(requestId, "SUCCESS");
      } else if (status.isMfaRequired) {
        await this.openTrustedDomainTabService.openTab();
        this.worker.port.emit(requestId, "SUCCESS");
      } else {
        const webIntegrationWorker = await WorkerService.get("WebIntegration", this.worker.tab.id);
        webIntegrationWorker.port.emit("passbolt.in-form-menu.open", applicationId);
      }
    } catch (error) {
      console.error(error);
      this.worker.port.emit(requestId, "ERROR", error);
    }
  }
}

export default InformCallToActionController;
