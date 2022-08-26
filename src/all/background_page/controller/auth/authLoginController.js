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

import AuthModel from "../../model/auth/authModel";
import UserAlreadyLoggedInError from "../../error/userAlreadyLoggedInError";
import GenerateSsoKeyService from "../../service/crypto/generateSsoKeyService";
import GenerateSsoIvService from "../../service/crypto/generateSsoIvService";
import EncryptSsoPassphraseService from "../../service/crypto/encryptSsoPassphraseService";
import SsoDataStorage from "../../service/indexedDB_storage/ssoDataStorage";
import SsoUserServerDataModel from "../../model/sso/ssoUserServerDataModel";
//@todo @mock remove
import browser from "webextension-polyfill";

class AuthLoginController {
  /**
   * AuthLoginController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions the api client options
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.authModel = new AuthModel(apiClientOptions);
    this.ssoUserServerData = new SsoUserServerDataModel(apiClientOptions);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @param {uuid} requestId The request identifier
   * @param {string} passphrase The passphrase to decryt the private key
   * @param {string} remember whether to remember the passphrase
   *   (bool) false|undefined if should not remember
   *   (integer) -1 if should remember for the session
   *   (integer) duration in seconds to specify a specific duration
   * @return {Promise<void>}
   */
  async _exec(passphrase, remember) {
    try {
      await this.exec(passphrase, remember);
      this.worker.port.emit(this.requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Attemps to sign in the current user.
   *
   * @param {string} passphrase The passphrase to decryt the private key
   * @param {string} remember whether to remember the passphrase
   *   (bool) false|undefined if should not remember
   *   (integer) -1 if should remember for the session
   *   (integer) duration in seconds to specify a specific duration
   * @return {Promise<void>}
   */
  async exec(passphrase, remember) {
    try {
      await this.authModel.login(passphrase, remember);
    } catch (error) {
      if (!(error instanceof UserAlreadyLoggedInError)) {
        throw error;
      }
    }

    await this.configureUserSsoAuth(passphrase);
  }

  /**
   * Configure the current user's SSO authentication.
   *
   * @param {string} passphrase The passphrase to encrypt for SSO
   * @return {Promise<void>}
   */
  async configureUserSsoAuth(passphrase) {
    try {
      const nek = await GenerateSsoKeyService.generateSsoKey();
      const extractableKey = await GenerateSsoKeyService.generateSsoKey(true);
      const iv1 = GenerateSsoIvService.generateIv();
      const iv2 = GenerateSsoIvService.generateIv();

      const cipheredPassphrase = await EncryptSsoPassphraseService.encrypt(passphrase, nek, extractableKey, iv1, iv2);

      //@todo: do it in a service ?
      const serializedKey = await crypto.subtle.exportKey("jwk", extractableKey);
      const ssoUserServerData = {
        key: serializedKey,
        cipher: cipheredPassphrase
      };

      //@todo @mock: remove the following line
      await browser.storage.local.set({__tmp__sso_user_server_data: ssoUserServerData});
      console.log(ssoUserServerData);

      const ssoUserClientData = {nek, iv1, iv2};
      await SsoDataStorage.save(ssoUserClientData);

      await this.ssoUserServerData.updateUserData(ssoUserServerData);
    } catch (error) {
      await SsoDataStorage.wipeData();
      throw error;
    }
  }
}

export default AuthLoginController;
