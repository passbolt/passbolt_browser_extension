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
 * @since         3.7.3
 */

import SsoDataStorage from "../../service/indexedDB_storage/ssoDataStorage";
import DecryptSsoPassphraseService from "../../service/crypto/decryptSsoPassphraseService";
import SsoUserServerDataModel from "../../model/sso/ssoUserServerDataModel";
import AzurePopupHandlerService from "../../service/sso/azurePopupHandlerService";
import {Buffer} from 'buffer';

class AzureSsoAuthenticationController {
  /**
   * AzureSsoAuthenticationController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.ssoUserServerDataModel = new SsoUserServerDataModel(apiClientOptions);
    this.azurePopupHandler = new AzurePopupHandlerService(apiClientOptions);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @return {Promise<SsoConfigurationEntity|null>}
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
   * Get the current user's passphrase using SSO authentication.
   *
   * @return {Promise<string>}
   */
  async exec() {
    try {
      const thirdPartyCode = await this.azurePopupHandler.getCodeFromThirdParty();
      const ssoServerData = await this.ssoUserServerDataModel.findUserData(thirdPartyCode);
      const ssoClientData = await SsoDataStorage.get();

      if (ssoClientData === null) {
        throw new Error("Can't attempt SSO login as SSO is not configured on this browser extension.");
      }

      //@todo: do it in a service ?
      const tmpKey = ssoServerData.key;
      const serverKey = await crypto.subtle.importKey("jwk", tmpKey, 'AES-GCM', true, ["encrypt", "decrypt"]);
      const serverCipher = Buffer.from(ssoServerData.cipher, 'base64');


      const passphrase = await DecryptSsoPassphraseService.decrypt(serverCipher, ssoClientData.nek, serverKey, ssoClientData.iv1, ssoClientData.iv2);
      await this.azurePopupHandler.closeHandler();
      return passphrase;
    } catch (error) {
      console.log("An error occured while handle Azure sign in:", error);
      this.azurePopupHandler.closeHandler();
      throw error;
    }
  }
}

export default AzureSsoAuthenticationController;
