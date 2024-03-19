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
 */
import GpgAuth from "../gpgauth";
import AuthLogoutService from 'passbolt-styleguide/src/shared/services/api/auth/AuthLogoutService';
import AuthStatusLocalStorage from "../../service/local_storage/authStatusLocalStorage";
import User from "../user";
import GetDecryptedUserPrivateKeyService from "../../service/account/getDecryptedUserPrivateKeyService";
import PassphraseStorageService from "../../service/session_storage/passphraseStorageService";
import StartLoopAuthSessionCheckService from "../../service/auth/startLoopAuthSessionCheckService";

class AuthModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.authLogoutService = new AuthLogoutService(apiClientOptions);
    this.legacyAuthModel = new GpgAuth();
  }

  /**
   * Logout
   * @returns {Promise<void>}
   */
  async logout() {
    await this.authLogoutService.logout();
    await this.postLogout();
  }

  /**
   * Post logout
   * @returns {Promise<void>}
   */
  async postLogout() {
    const isAuthenticated = false;
    const isMfaRequired = false;
    await AuthStatusLocalStorage.set(isAuthenticated, isMfaRequired);
    const event = new Event('passbolt.auth.after-logout');
    self.dispatchEvent(event);
  }

  /**
   * Login
   * @param {string} passphrase The passphrase to use to decrypt the user private key
   * @param {boolean?} rememberUntilLogout Should the passphrase remember until the user is logged out
   * @returns {Promise<void>}
   */
  async login(passphrase, rememberUntilLogout) {
    rememberUntilLogout = rememberUntilLogout || false;
    const user = User.getInstance();
    const privateKey = await GetDecryptedUserPrivateKeyService.getKey(passphrase);
    // @deprecated to be removed with v4. Prior to API v3, retrieving the CSRF token log the user out, so we need to fetch it before the login.
    await user.retrieveAndStoreCsrfToken();
    await this.legacyAuthModel.login(privateKey);
    /*
     * Post login operations
     * MFA may not be complete yet, so no need to preload things here
     */
    if (rememberUntilLogout) {
      await PassphraseStorageService.set(passphrase, -1);
    }
    await this.postLogin();
  }

  /**
   * Post login
   * @returns {Promise<void>}
   */
  async postLogin() {
    const startLoopAuthSessionCheckService = new StartLoopAuthSessionCheckService(this.legacyAuthModel);
    await startLoopAuthSessionCheckService.exec();
    const event = new Event('passbolt.auth.after-login');
    self.dispatchEvent(event);
  }
}

export default AuthModel;
