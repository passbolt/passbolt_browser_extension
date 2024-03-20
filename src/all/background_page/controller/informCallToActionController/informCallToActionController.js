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
import User from "../../model/user";
import ResourceModel from "../../model/resource/resourceModel";
import {QuickAccessService} from "../../service/ui/quickAccess.service";
import WorkerService from "../../service/worker/workerService";
import CheckAuthStatusService from "../../service/auth/checkAuthStatusService";

/**
 * Controller related to the in-form call-to-action
 */
class InformCallToActionController {
  /**
   * InformCallToActionController constructor
   * @param {Worker} worker
   * @param {ApiClientOptions} clientOptions
   * @param {AccountEntity} account the user account
   */
  constructor(worker, clientOptions, account) {
    this.worker = worker;
    this.resourceModel = new ResourceModel(clientOptions, account);
    this.checkAuthStatusService = new CheckAuthStatusService();
  }

  /**
   * Whenever one intends to check the status of the call-to-action (authenticated / unauthenticated mode)
   * @param requestId
   */
  async checkStatus(requestId) {
    try {
      const status = await this.checkAuthStatusService.checkAuthStatus(false);
      this.worker.port.emit(requestId, "SUCCESS", status);
    } catch (error) {
      /*
       * When we are in a logged out mode and there's some cleaning of the local storage
       * the check status request the api. In case of unauthenticated user, it throws a 401
       * that we catch right here
       */
      this.worker.port.emit(requestId, "SUCCESS", {isAuthenticated: false});
    }
  }

  /**
   * Whenever one intends to know the count of suggested resources
   * @param requestId The identifier of the request
   */
  async countSuggestedResourcesCount(requestId) {
    try {
      const suggestedResourcesCount = await this.resourceModel.countSuggestedResources(this.worker.tab.url);
      this.worker.port.emit(requestId, "SUCCESS", suggestedResourcesCount);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(requestId, 'ERROR', error);
    }
  }


  /**
   * Whenever the user executes the inform call-to-action
   * @param requestId The identifier of the request
   */
  async execute(requestId) {
    try {
      const status = await this.checkAuthStatusService.checkAuthStatus(false);
      if (!status.isAuthenticated) {
        const queryParameters = [
          {name: "uiMode", value: "detached"},
          {name: "feature", value: "login"}
        ];
        await QuickAccessService.openInDetachedMode(queryParameters);
        this.worker.port.emit(requestId, "SUCCESS");
      } else if (status.isMfaRequired) {
        browser.tabs.create({url: User.getInstance().settings.getDomain(), active: true});
        this.worker.port.emit(requestId, "SUCCESS");
      } else {
        const webIntegrationWorker = await WorkerService.get('WebIntegration', this.worker.tab.id);
        webIntegrationWorker.port.emit('passbolt.in-form-menu.open');
      }
    } catch (error) {
      console.error(error);
      this.worker.port.emit(requestId, 'ERROR', error);
    }
  }
}


export default InformCallToActionController;
