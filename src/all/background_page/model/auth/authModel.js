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
const app = require("../../app");
const {GpgAuthHeader} = require("../gpgAuthHeader");
const {GpgAuthToken} = require("../gpgAuthToken");
const {AuthStatusLocalStorage} = require("../../service/local_storage/authStatusLocalStorage");
const {GpgAuth} = require("../gpgauth");
const {AuthService} = require("../../service/api/auth/authService");
const {User} = require("../user");
const {Keyring} = require("../keyring");
const {Crypto} = require("../crypto");

class AuthModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.authService = new AuthService(apiClientOptions);
    const keyring = new Keyring();
    this.crypto = new Crypto(keyring);
    this.legacyAuthModel = new GpgAuth(keyring);
  }

  /**
   * Logout
   * @returns {Promise<void>}
   */
  async logout() {
    await this.authService.logout();
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
    window.dispatchEvent(event);
  }

  /**
   * Get server key
   * @returns {Promise<object>} The server key dto {fingerprint: string, armored_key: string}
   */
  async getServerKey() {
    return this.authService.getServerKey();
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
    const privateKey = await this.crypto.getAndDecryptPrivateKey(passphrase);
    // @deprecated to be removed with v4. Prior to API v3, retrieving the CSRF token log the user out, so we need to fetch it before the login.
    await user.retrieveAndStoreCsrfToken();
    await this.legacyAuthModel.login(privateKey);
    // Post login operations
    // MFA may not be complete yet, so no need to preload things here
    if (rememberUntilLogout) {
      user.storeMasterPasswordTemporarily(passphrase, -1);
    }
    await this.postLogin();
  }

  /**
   * Post login
   * @returns {Promise<void>}
   */
  async postLogin() {
    await this.legacyAuthModel.startCheckAuthStatusLoop();
    await app.pageMods.AppBoostrap.init();
    const event = new Event('passbolt.auth.after-login');
    window.dispatchEvent(event);
  }

  /**
   * Verify the server identify
   *
   * @param {string} serverKey The public key to use to encrypt the serverToken
   * @param {string} fingerprint The fingerprint to verify
   * @throws {Error} If the token cannot be encrypted
   * @throws {Error} if verification procedure fails
   * @returns {Promise<void>}
   */
  async verify(serverKey, fingerprint) {
    let encryptedToken, originalToken;
    try {
      originalToken = new GpgAuthToken();
      encryptedToken = await this.crypto.encrypt(originalToken.token, serverKey)
    } catch (error) {
      throw new Error('Unable to encrypt the verify token.' + ' ' + error.message);
    }

    const response = await this.authService.verify(fingerprint, encryptedToken);

    // Check that the server was able to decrypt the token with our local copy
    const auth = new GpgAuthHeader(response.headers, 'verify');
    const verifyToken = new GpgAuthToken(auth.headers['x-gpgauth-verify-response']);
    if (verifyToken.token !== originalToken.token) {
      throw new Error('The server was unable to prove it can use the advertised OpenPGP key.');
    }
  }
}

exports.AuthModel = AuthModel;
