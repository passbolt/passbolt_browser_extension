/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.9.0
 */
import AzurePopupHandlerService from "../../service/sso/azurePopupHandlerService";
import SsoDryRunModel from "../../model/sso/ssoDryRunModel";
import SsoSettingsModel from "../../model/sso/ssoSettingsModel";

class TestAzureSsoAuthenticationController {
  /**
   * TestAzureSsoAuthenticationController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.ssoSettingsModel = new SsoSettingsModel(apiClientOptions);
    this.ssoDryRunModel = new SsoDryRunModel(apiClientOptions);
    this.azurePopupHandler = new AzurePopupHandlerService(account.domain, true);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @param {uuid} draftSsoSettingsId the draft sso settings id
   * @return {Promise<void>}
   */
  async _exec(draftSsoSettingsId) {
    try {
      const ssoToken = await this.exec(draftSsoSettingsId);
      this.worker.port.emit(this.requestId, "SUCCESS", ssoToken);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Run a dry-run login and returns a token from the API if everything is fine.
   * The token can be used to change the status of the sso settings to `active`
   *
   * @param {uuid} draftSsoSettingsId the draft sso settings id
   * @return {Promise<string>}
   */
  async exec(draftSsoSettingsId) {
    try {
      const ssoSettings = await this.ssoSettingsModel.getById(draftSsoSettingsId);
      const thirdPartySignInUrl = await this.ssoDryRunModel.getUrl(ssoSettings.provider, ssoSettings.id);
      const ssoToken = await this.azurePopupHandler.getCodeFromThirdParty(thirdPartySignInUrl);
      await this.azurePopupHandler.closeHandler();
      return ssoToken;
    } catch (error) {
      console.log("An error occured while handle Azure sign in:", error);
      throw error;
    }
  }
}

export default TestAzureSsoAuthenticationController;
