/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.9.0
 */
const Uuid = require('../utils/uuid');
const {ApiClientOptions} = require("../service/api/apiClient/apiClientOptions");

const {AuthService} = require('../service/auth');
const {User} = require('./user');
const {Keyring} = require('./keyring');
const {Crypto} = require('./crypto');
const {GpgAuthToken} = require('./gpgAuthToken');
const {GpgAuthHeader} = require('./gpgAuthHeader');
const {MfaAuthenticationRequiredError} = require('../error/mfaAuthenticationRequiredError');
const {Request} = require('./request');
const {OrganizationSettingsModel} = require('./organizationSettings/organizationSettingsModel');
const {AuthStatusLocalStorage} = require('../service/local_storage/authStatusLocalStorage');

const URL_VERIFY = '/auth/verify.json?api-version=v2';
const URL_LOGIN = '/auth/login.json?api-version=v2';
const CHECK_IS_AUTHENTICATED_INTERVAL_PERIOD = 60000;
const MAX_IS_AUTHENTICATED_INTERVAL_PERIOD = 2147483647;

/**
 * GPGAuth authentication
 * @constructor
 */
class GpgAuth {
  /**
   * @param {Keyring} [keyring] optional
   */
  constructor(keyring) {
    this.keyring = keyring ? keyring : new Keyring();
    this.crypto = new Crypto(this.keyring);

    // Check the authentication status interval.
    this.checkIsAuthenticatedTimeout = null;
    // Latest stored auth user status.
    this.authStatus = null;
  }

  /**
   * Alias for User settings get domain
   *
   * @throw {Error} if the trusted domain is not set
   * @returns {string}
   */
  getDomain() {
    return User.getInstance().settings.getDomain();
  }

  /**
   * Verify the server identify
   *
   * @param {string} [serverUrl] optional
   * @param {string} [armoredServerKey] optional
   * @param {string} [userFingerprint] optional
   * @throws {Error} if domain is undefined in settings and serverUrl is not provided
   * @throws {Error} if verification procedure fails
   * @returns {Promise<void>}
   */
  async verify(serverUrl, armoredServerKey, userFingerprint) {
    const domain = serverUrl || this.getDomain();
    const serverKey = armoredServerKey || this.keyring.findPublic(Uuid.get(domain)).armoredKey;
    const fingerprint = userFingerprint || this.keyring.findPrivate().fingerprint;

    // Encrypt a random token
    let encrypted, originalToken;
    try {
      originalToken = new GpgAuthToken();
      encrypted = await this.crypto.encrypt(originalToken.token, serverKey);
    } catch (error) {
      throw new Error(`Unable to encrypt the verify token. ${error.message}`);
    }

    // Prepare the request data
    const data = new FormData();
    data.append('data[gpg_auth][keyid]', fingerprint);
    data.append('data[gpg_auth][server_verify_token]', encrypted);

    // Send the data
    const fetchOptions = {
      method: 'POST',
      credentials: 'include',
      body: data
    };
    Request.setCsrfHeader(fetchOptions, User.getInstance());
    const response = await fetch(domain + URL_VERIFY, fetchOptions);

    // If the server responded with an error build a relevant message
    if (!response.ok) {
      const json = await response.json();
      if (typeof json.header !== 'undefined') {
        throw new Error(json.header.message);
      } else {
        const msg = `Server request failed (${response.status}) without providing additional information.`;
        throw new Error(msg);
      }
    }

    // Check that the server was able to decrypt the token with our local copy
    const auth = new GpgAuthHeader(response.headers, 'verify');
    const verifyToken = new GpgAuthToken(auth.headers['x-gpgauth-verify-response']);
    if (verifyToken.token !== originalToken.token) {
      throw new Error('The server was unable to prove it can use the advertised OpenPGP key.');
    }
  }

  /**
   * Check if the server key has changed
   * @return {boolean} true if key has changed
   */
  async serverKeyChanged() {
    const remoteKey = await this.getServerKey();
    const localKey = this.getServerKeyFromKeyring().armoredKey;
    return remoteKey.keydata.trim() !== localKey.trim();
  }

  /**
   * Get Server key from keyring
   * @returns {object}
   */
  getServerKeyFromKeyring() {
    return this.keyring.findPublic(Uuid.get(this.getDomain()));
  }

  /**
   * isServerKeyExpired
   * @returns {boolean}
   */
  isServerKeyExpired() {
    const key = this.getServerKeyFromKeyring();
    return key.isExpired;
  }

  /**
   * Get Server key for GPG auth.
   *
   * @param {string} [serverUrl] optional domain where to get the key.
   * if domain is not provided, then look in the settings.
   *
   * @returns {Promise.<object>}
   */
  async getServerKey(serverUrl) {
    const domain = serverUrl || this.getDomain();
    const response = await fetch(domain + URL_VERIFY, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      const msg = 'There was a problem when trying to communicate with the server' + ` (Code: ${response.status})`;
      throw new Error(msg);
    }

    const json = await response.json();
    return json.body;
  }

  /**
   * GPGAuth Login - handle stage1, stage2 and complete
   *
   * @param privateKey {openpgp.key.Key} The decrypted private key to use to decrypt the message.
   * @returns {Promise.<string>} referrer url
   */
  async login(privateKey) {
    const userAuthToken = await this.stage1(privateKey);
    await this.stage2(userAuthToken, privateKey);
  }

  /**
   * GPGAuth stage1 - get and decrypt a verification given by the server
   *
   * @param privateKey {openpgp.key.Key} The decrypted private key to use to decrypt the message.
   * @returns {Promise.<string>} token
   */
  async stage1(privateKey) {
    // Prepare request data
    const url = this.getDomain() + URL_LOGIN;
    const body = new FormData();
    body.append('data[gpg_auth][keyid]', privateKey.primaryKey.getFingerprint());
    const fetchOptions = {
      method: 'POST',
      credentials: 'include',
      body: body
    };
    Request.setCsrfHeader(fetchOptions, User.getInstance());

    // Send request token to the server
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      return this.onResponseError(response);
    }

    // Check headers
    const auth = new GpgAuthHeader(response.headers, 'stage1');

    // Try to decrypt the User Auth Token
    const encryptedUserAuthToken = stripslashes(urldecode(auth.headers['x-gpgauth-user-auth-token']));
    const userAuthToken = await this.crypto.decryptWithKey(encryptedUserAuthToken, privateKey);

    // Validate the User Auth Token
    const authToken = new GpgAuthToken(userAuthToken);
    return authToken.token;
  }

  /**
   * Stage 2. send back the token to the server to get auth cookie
   *
   * @param userAuthToken {string} The user authentication token
   * @param {openpgp.key.Key} privateKey decrypted private key
   * @returns {Promise.<string>} url to redirect the user to
   */
  async stage2(userAuthToken, privateKey) {
    // Prepare request data
    const url = this.getDomain() + URL_LOGIN;
    const domain = User.getInstance().settings.getDomain();
    const data = new FormData();
    data.append('data[gpg_auth][keyid]', privateKey.primaryKey.getFingerprint());
    data.append('data[gpg_auth][user_token_result]', userAuthToken);

    // Send it over
    const fetchOptions = {
      method: 'POST',
      credentials: 'include',
      body: data
    };
    Request.setCsrfHeader(fetchOptions, User.getInstance());
    const response = await fetch(url, fetchOptions);

    // Check response status
    if (!response.ok) {
      await this.onResponseError(response);
    }

    // Check the headers and return the redirection url
    const auth = new GpgAuthHeader(response.headers, 'complete');
    return domain + auth.headers['x-gpgauth-refer'];
  }

  /**
   * Handle the creation of an error when response status is no ok
   *
   * @param response {object}
   * @returns {Promise.<error>} throw a relevant exception
   */
  async onResponseError(response) {
    const error_msg = 'There was a server error. No additional information provided' + `(${response.status}`;
    let json;
    try {
      json = await response.json();
    } catch (error) {
      throw new Error(error_msg);
    }
    if (typeof json.header !== 'undefined') {
      throw new Error(json.header.message);
    }
    throw new Error(error_msg);
  }

  /**
   * Check if the user is authenticated.
   * @param {object} [options] Optional parameters
   * - options.requestApi {bool}, get the status from the API, default true.
   * @return {bool}
   */
  async isAuthenticated(options) {
    const authStatus = await this.checkAuthStatus(options);
    return authStatus.isAuthenticated;
  }

  /**
   * Check if the user needs to complete the MFA.
   *
   * @return {bool}
   */
  async isMfaRequired() {
    const authStatus = await this.checkAuthStatus();
    return authStatus.isMfaRequired;
  }

  /**
   * Request the server and retrieve the auth status.
   * @param {object} [options] Optional parameters
   * - options.requestApi {bool}, get the status from the API, default true.
   * @return {object}
   *  {
   *    isAuthenticated: {bool} true if the user is authenticated, false otherwise
   *    isMfaRequired: {bool} true if the mfa is required, false otherwise.
   *  }
   */
  async checkAuthStatus(options) {
    let isAuthenticated, isMfaRequired;
    // Define options.
    options = Object.assign({
      requestApi: true
    }, options);

    /*
     * No request to API required, return the latest stored information.
     * Check in the local storage if any
     */
    if (!options.requestApi) {
      try {
        const storedStatus = await AuthStatusLocalStorage.get();
        if (storedStatus) {
          this.authStatus = storedStatus;
          return this.authStatus;
        }
      } catch (error) {
        /*
         * Nothing found, check with the API
         * continue...
         */
      }
    }

    try {
      isAuthenticated = await AuthService.isAuthenticated();
      isMfaRequired = false;
    } catch (error) {
      if (error instanceof MfaAuthenticationRequiredError) {
        isAuthenticated = true;
        isMfaRequired = true;
      } else {
        throw error;
      }
    }

    this.authStatus = {isAuthenticated: isAuthenticated, isMfaRequired: isMfaRequired};
    await AuthStatusLocalStorage.set(isAuthenticated, isMfaRequired);
    return this.authStatus;
  }

  /**
   * Start an invertval to check if the user is authenticated.
   * - In the case the user is logged out, trigger a passbolt.auth.after-logout event.
   *
   * @return {void}
   */
  async startCheckAuthStatusLoop() {
    const timeoutPeriod = await this.getCheckAuthStatusTimeoutPeriod();

    if (this.checkAuthStatusTimeout) {
      clearTimeout(this.checkAuthStatusTimeout);
    }

    this.checkAuthStatusTimeout = setTimeout(async() => {
      if (!await this.isAuthenticated()) {
        window.dispatchEvent(new Event('passbolt.auth.after-logout'));
      } else {
        this.startCheckAuthStatusLoop();
      }
    }, timeoutPeriod);
  }

  /**
   * Get the interval period the is authenticated check should be performed.
   *
   * The interval varies regarding the version of the API.
   * - With API >= v2.11.0 the check can be performed every CHECK_IS_AUTHENTICATED_INTERVAL_PERIOD seconds.
   *   The entry point introduced with v2.11.0 (/auth/is-authenticated) does not extend the user session.
   * - With API < v2.11.0 the check cannot be performed every CHECK_IS_AUTHENTICATED_INTERVAL_PERIOD seconds.
   *   The entry point /auth/checksession is extending the session, and therefor the check should be done
   *   as per the session timeout.
   *
   * @return {int}
   */
  async getCheckAuthStatusTimeoutPeriod() {
    let timeoutPeriod = CHECK_IS_AUTHENTICATED_INTERVAL_PERIOD;

    /*
     * The entry point available before v2.11.0 extends the session expiry period.
     * Define the check interval based on the server session timeout.
     */
    if (AuthService.useLegacyIsAuthenticatedEntryPoint === true) {
      const domain = User.getInstance().settings.getDomain();
      const apiClientOptions = (new ApiClientOptions()).setBaseUrl(domain);
      const organizationSettingsModel = new OrganizationSettingsModel(apiClientOptions);
      const settings = await organizationSettingsModel.getOrFind();
      // By default a default php session expires after 24 min.
      let sessionTimeout = 24;
      /*
       * Check if the session timeout is provided in the settings.
       * If not provided it means the user is not logged in or the MFA is required.
       */
      if (settings && settings.app && settings.app.session_timeout) {
        sessionTimeout = settings.app.session_timeout;
      }
      /*
       * Convert the timeout in millisecond and add 1 second to ensure the session is well expired
       * when the request is made.
       */
      timeoutPeriod = ((sessionTimeout * 60) + 1) * 1000;

      // Fix https://github.com/passbolt/passbolt_browser_extension/issues/84
      if (timeoutPeriod > MAX_IS_AUTHENTICATED_INTERVAL_PERIOD) {
        timeoutPeriod = MAX_IS_AUTHENTICATED_INTERVAL_PERIOD;
      }
      if (timeoutPeriod < CHECK_IS_AUTHENTICATED_INTERVAL_PERIOD) {
        timeoutPeriod = CHECK_IS_AUTHENTICATED_INTERVAL_PERIOD;
      }
    }

    return timeoutPeriod;
  }
}
// Exports the Authentication model object.
exports.GpgAuth = GpgAuth;
