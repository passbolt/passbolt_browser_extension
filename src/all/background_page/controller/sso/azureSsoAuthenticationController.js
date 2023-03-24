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
import SsoDataStorage from "../../service/indexedDB_storage/ssoDataStorage";
import DecryptSsoPassphraseService from "../../service/crypto/decryptSsoPassphraseService";
import AzurePopupHandlerService from "../../service/sso/azurePopupHandlerService";
import SsoKitServerPartModel from "../../model/sso/ssoKitServerPartModel";
import SsoAzureLoginModel from "../../model/sso/ssoAzureLoginModel";
import AuthModel from "../../model/auth/authModel";
import {QuickAccessService} from "../../service/ui/quickAccess.service";

class AzureSsoAuthenticationController {
  /**
   * AzureSsoAuthenticationController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.account = account;
    this.ssoKitServerPartModel = new SsoKitServerPartModel(apiClientOptions);
    this.ssoAzureLoginModel = new SsoAzureLoginModel(apiClientOptions);
    this.azurePopupHandler = new AzurePopupHandlerService(account.domain, worker?.tab?.id, false);
    this.authModel = new AuthModel(apiClientOptions);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @param {boolean} isInQuickAccessMode true if the controller has been called from the quickaccess
   * @return {Promise<void>}
   */
  async _exec(isInQuickAccessMode = false) {
    try {
      await this.exec(isInQuickAccessMode);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Authenticate the user using Azure as the SSO provider.
   *
   * @param {boolean} isInQuickAccessMode true if the controller has been called from the quickaccess
   * @return {Promise<void>}
   */
  async exec(isInQuickAccessMode) {
    try {
      const clientPartSsoKit = await SsoDataStorage.get();
      if (!clientPartSsoKit) {
        throw new Error("The Single Sign-On cannot proceed as there is no SSO kit registered on this browser profile.");
      }
      const userId = this.account.userId;
      const loginUrl = await this.ssoAzureLoginModel.getLoginUrl(userId);
      const thirdPartyCode = await this.azurePopupHandler.getSsoTokenFromThirdParty(loginUrl);
      const ssoServerData = await this.ssoKitServerPartModel.getSsoKit(clientPartSsoKit.id, userId, thirdPartyCode);

      const serverKey = await crypto.subtle.importKey("jwk", ssoServerData.key, 'AES-GCM', true, ["encrypt", "decrypt"]);

      const passphrase = await DecryptSsoPassphraseService.decrypt(clientPartSsoKit.secret, clientPartSsoKit.nek, serverKey, clientPartSsoKit.iv1, clientPartSsoKit.iv2);
      await this.azurePopupHandler.closeHandler();
      await this.authModel.login(passphrase, true);
      if (isInQuickAccessMode) {
        await this.ensureRedirectionInQuickaccessMode();
      }
    } catch (error) {
      console.error("An error occured while handle Azure sign in:", error);
      this.handleSpecificErrors(error);
      throw error;
    }
  }

  /**
   * Opens the quickacces in detached mode to ensure the redirection after login is made.
   * Calling this is only done when signin-in with SSO via the quickaccess.
   * The reason is to avoid a problem where closing the SSO popup actually closes the quickaccess,
   * as a consequence, the port is disconnected as well.
   * What could happen is that the port is disconnected before the `_exec` returns the "SUCCESS" and
   * the login process stops from the styleguide point of view, makinng it broken somehow
   * the login wouldn't redirect to ressource workspace neither redirect to MFA if required.
   * @returns {Promise<void>}
   */
  async ensureRedirectionInQuickaccessMode() {
    const queryParameters = [
      {name: "uiMode", value: "detached"},
      {name: "feature", value: "login"}
    ];
    await QuickAccessService.openInDetachedMode(queryParameters);
  }

  /**
   * Handles error of different type coming from the SSO authentication process
   * @param {Error} error
   */
  handleSpecificErrors(error) {
    switch (error.name) {
      case 'InvalidMasterPasswordError':
      case 'OutdatedSsoKitError': {
        SsoDataStorage.flush();
        break;
      }
      case 'PassboltApiFetchError': {
        const isCsrfTokenError = error?.data?.code === 403;
        if (!isCsrfTokenError) {
          SsoDataStorage.flush();
        }
      }
    }
  }
}

export default AzureSsoAuthenticationController;
