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
import PopupHandlerService from "../../service/sso/popupHandlerService";
import SsoDryRunModel from "../../model/sso/ssoDryRunModel";
import SsoSettingsModel from "../../model/sso/ssoSettingsModel";
import {assertUuid} from "../../utils/assertions";

class TestSsoAuthenticationController {
  /**
   * TestSsoAuthenticationController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.ssoSettingsModel = new SsoSettingsModel(apiClientOptions);
    this.ssoDryRunModel = new SsoDryRunModel(apiClientOptions);
    this.popupHandler = new PopupHandlerService(account.domain, worker?.tab?.id, true);
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
    assertUuid(draftSsoSettingsId, "The SSO settings id should be a valid uuid.");

    try {
      const ssoSettings = await this.ssoSettingsModel.getById(draftSsoSettingsId);
      const thirdPartySignInUrl = await this.ssoDryRunModel.getUrl(ssoSettings.provider, ssoSettings.id);
      const ssoToken = await this.popupHandler.getSsoTokenFromThirdParty(thirdPartySignInUrl);
      await this.popupHandler.closeHandler();
      return ssoToken;
    } catch (error) {
      console.log("An error occured while attempting sign in with a third party provider:", error);
      throw error;
    }
  }
}

export default TestSsoAuthenticationController;
