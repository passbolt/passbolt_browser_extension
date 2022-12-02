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
import {Buffer} from 'buffer';
import SsoKitServerPartModel from "../../model/sso/ssoKitServerPartModel";
import SsoAzureLoginModel from "../../model/sso/ssoAzureLoginModel";
import AuthModel from "../../model/auth/authModel";
import ClientSsoKitNotFoundError from "../../error/clientSsoKitNotFoundError";

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
    this.azurePopupHandler = new AzurePopupHandlerService(account.domain, false);
    this.authModel = new AuthModel(apiClientOptions);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @return {Promise<void>}
   */
  async _exec() {
    try {
      const passphrase = await this.exec();
      this.worker.port.emit(this.requestId, "SUCCESS", passphrase);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Authenticate the user using the third party SSO provider.
   *
   * @return {Promise<void>}
   */
  async exec() {
    try {
      const clientPartSsoKit = await SsoDataStorage.get();
      if (!clientPartSsoKit) {
        throw new ClientSsoKitNotFoundError("The Single Sign-On cannot proceed as there is no SSO kit registered on this browser profile.");
      }
      const userId = this.account.userId;
      const loginUrl = await this.ssoAzureLoginModel.getLoginUrl(userId);
      const thirdPartyCode = await this.azurePopupHandler.getCodeFromThirdParty(loginUrl);
      const ssoServerData = await this.ssoKitServerPartModel.getSsoKit(clientPartSsoKit.id, userId, thirdPartyCode);

      const jsonServerKey = JSON.parse(Buffer.from(ssoServerData.data, "base64").toString());
      const serverKey = await crypto.subtle.importKey("jwk", jsonServerKey, 'AES-GCM', true, ["encrypt", "decrypt"]);

      const passphrase = await DecryptSsoPassphraseService.decrypt(clientPartSsoKit.secret, clientPartSsoKit.nek, serverKey, clientPartSsoKit.iv1, clientPartSsoKit.iv2);
      await this.azurePopupHandler.closeHandler();
      await this.authModel.login(passphrase, true);
    } catch (error) {
      console.error("An error occured while handle Azure sign in:", error);
      this.handleSpecificErrors(error);
      throw error;
    }
  }

  /**
   * Handles error of different type coming from the SSO authentication process
   * @param {Error} error
   */
  handleSpecificErrors(error) {
    switch (error.name) {
      case 'InvalidMasterPasswordError':
      case 'PassboltApiFetchError':
      case 'OutdatedSsoKitError': {
        SsoDataStorage.flush();
      }
    }
  }
}

export default AzureSsoAuthenticationController;
