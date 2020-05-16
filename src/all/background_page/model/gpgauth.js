"use strict";
/**
 * GpgAuth model.
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const __ = require('../sdk/l10n').get;
const AuthService = require('../service/auth').AuthService;
const User = require('./user').User;
const Keyring = require('./keyring').Keyring;
const Crypto = require('./crypto').Crypto;
const Uuid = require('../utils/uuid');
const GpgAuthToken = require('./gpgAuthToken').GpgAuthToken;
const GpgAuthHeader = require('./gpgAuthHeader').GpgAuthHeader;
const MfaAuthenticationRequiredError = require('../error/mfaAuthenticationRequiredError').MfaAuthenticationRequiredError;
const Request = require('./request').Request;
const SiteSettings = require('./siteSettings').SiteSettings;

const URL_VERIFY = '/auth/verify.json?api-version=v1';
const URL_LOGIN = '/auth/login.json?api-version=v1';
const URL_LOGOUT = '/auth/logout.json?api-version=v1';
const CHECK_IS_AUTHENTICATED_INTERVAL_PERIOD = 60000;
const MAX_IS_AUTHENTICATED_INTERVAL_PERIOD = 2147483647;

/**
 * GPGAuth authentication
 * @constructor
 */
let GpgAuth = function () {
  this.keyring = new Keyring();
};

/**
 * Check the authentication status interval.
 */
GpgAuth.checkIsAuthenticatedTimeout = null;

/**
 * Latest stored auth user status.
 */
GpgAuth._authStatus = null;

/**
 * Alias for User settings get domain
 *
 * @throws Error if domain is undefined
 * @returns {string}
 */
GpgAuth.prototype.getDomain = function () {
  return User.getInstance().settings.getDomain();
};

/**
 * Verify the server identify
 *
 * @param serverUrl {string} optional
 * @param armoredServerKey {string} optional
 * @param userFingerprint {string} optional
 * @throws Error if domain is undefined in settings and serverUrl is not provided
 * @throws Error if verification procedure fails
 * @returns {Promise<void>}
 */
GpgAuth.prototype.verify = async function (serverUrl, armoredServerKey, userFingerprint) {
  let domain = serverUrl || this.getDomain();
  let serverKey = armoredServerKey || this.keyring.findPublic(Uuid.get(domain)).key;
  let fingerprint = userFingerprint || this.keyring.findPrivate().fingerprint;

  // Encrypt a random token
  const crypto = new Crypto();
  let encrypted, originalToken;
  try {
    originalToken = new GpgAuthToken();
    encrypted = await crypto.encrypt(originalToken.token, serverKey)
  } catch (error) {
    throw new Error(__('Unable to encrypt the verify token.') + ' ' + error.message);
  }

  // Prepare the request data
  const data = new FormData();
  data.append('data[gpg_auth][keyid]', fingerprint);
  data.append('data[gpg_auth][server_verify_token]', encrypted);

  // Send the data
  let fetchOptions = {
    method: 'POST',
    credentials: 'include',
    body: data
  };
  Request.setCsrfHeader(fetchOptions);
  const response = await fetch(domain + URL_VERIFY, fetchOptions);

  // If the server responded with an error build a relevant message
  if (!response.ok) {
    let json = await response.json();
    if (typeof json.header !== 'undefined') {
      throw new Error(json.header.message);
    } else {
      const msg = __('Server request failed without providing additional information.') + ' (' + response.status + ')';
      throw new Error(msg);
    }
  }

  // Check that the server was able to decrypt the token with our local copy
  const auth = new GpgAuthHeader(response.headers, 'verify');
  const verifyToken = new GpgAuthToken(auth.headers['x-gpgauth-verify-response']);
  if (verifyToken.token !== originalToken.token) {
    throw new Error(__('The server was unable to prove it can use the advertised OpenPGP key.'));
  }
};

/**
 * Check if the server key has changed
 */
GpgAuth.prototype.serverKeyChanged = async function() {
  const remoteKey = await this.getServerKey();
  const localKey = await this.getServerKeyFromKeyring();
  return remoteKey.keydata.trim() !== localKey.trim();
};

/**
 * Get Server key from keyring
 * @returns {Promise<*>}
 */
GpgAuth.prototype.getServerKeyFromKeyring = async function() {
  return await this.keyring.findPublic(Uuid.get(this.getDomain())).key;
}

/**
 * isServerKeyExpired
 * @returns {Promise<boolean>}
 */
GpgAuth.prototype.isServerKeyExpired = async function() {
  const key = await this.getServerKeyFromKeyring();
  return await this.keyring.keyIsExpired(key);
}

/**
 * Get Server key for GPG auth.
 *
 * @param {string} [serverUrl] optional domain where to get the key.
 * if domain is not provided, then look in the settings.
 *
 * @returns {Promise.<string>}
 */
GpgAuth.prototype.getServerKey = async function (serverUrl) {
  let domain = serverUrl || this.getDomain();
  const response = await fetch(domain + URL_VERIFY, {
    method: 'GET',
    credentials: 'include'
  });

  if (!response.ok) {
    const msg = __('There was a problem when trying to communicate with the server') + ` (Code: ${response.status})`;
    throw new Error(msg);
  }

  const json = await response.json();
  return json.body;
};

/**
 * GPGAuth Logout
 *
 * @returns {Promise.<string>} referrer url
 */
GpgAuth.prototype.logout = async function () {
  const url = this.getDomain() + URL_LOGOUT;
  const fetchOptions = {
    method: 'GET',
    credentials: 'include'
  };

  GpgAuth._authStatus = { isAuthenticated: false, isMfaRequired: false };
  const event = new Event('passbolt.auth.logged-out');
  window.dispatchEvent(event);

  await fetch(url, fetchOptions);
};

/**
 * GPGAuth Login - handle stage1, stage2 and complete
 *
 * @param passphrase {string} The user private key passphrase
 * @returns {Promise.<string>} referrer url
 */
GpgAuth.prototype.login = async function (passphrase) {
  await this.keyring.checkPassphrase(passphrase);
  const userAuthToken = await this.stage1(passphrase);
  await this.stage2(userAuthToken);
};

/**
 * GPGAuth stage1 - get and decrypt a verification given by the server
 *
 * @param passphrase {string} The user private key passphrase
 * @returns {Promise.<string>} token
 */
GpgAuth.prototype.stage1 = async function (passphrase) {
  // Prepare request data
  const url = this.getDomain() + URL_LOGIN;
  const body = new FormData();
  body.append('data[gpg_auth][keyid]', this.keyring.findPrivate().fingerprint);
  const fetchOptions = {
    method: 'POST',
    credentials: 'include',
    body: body
  };
  Request.setCsrfHeader(fetchOptions);

  // Send request token to the server
  const response = await fetch(url, fetchOptions);
  if (!response.ok) {
    return this.onResponseError(response);
  }

  // Check headers
  const auth = new GpgAuthHeader(response.headers, 'stage1');

  // Try to decrypt the User Auth Token
  const crypto = new Crypto();
  const encryptedUserAuthToken = stripslashes(urldecode(auth.headers['x-gpgauth-user-auth-token']));
  let userAuthToken = await crypto.decrypt(encryptedUserAuthToken, passphrase);

  // Validate the User Auth Token
  let authToken = new GpgAuthToken(userAuthToken);
  return authToken.token;
};

/**
 * Stage 2. send back the token to the server to get auth cookie
 *
 * @param userAuthToken {string} The user authentication token
 * @returns {Promise.<string>} url to redirect the user to
 */
GpgAuth.prototype.stage2 = async function (userAuthToken) {
  // Prepare request data
  const url = this.getDomain() + URL_LOGIN;
  const domain = User.getInstance().settings.getDomain();
  const data = new FormData();
  data.append('data[gpg_auth][keyid]', (this.keyring.findPrivate()).fingerprint);
  data.append('data[gpg_auth][user_token_result]', userAuthToken);

  // Send it over
  const fetchOptions = {
    method: 'POST',
    credentials: 'include',
    body: data
  };
  Request.setCsrfHeader(fetchOptions);
  const response = await fetch(url, fetchOptions);

  // Check response status
  if (!response.ok) {
    this.onResponseError(response);
  }

  // Check the headers and return the redirection url
  const auth = new GpgAuthHeader(response.headers, 'complete');
  return domain + auth.headers['x-gpgauth-refer'];
};

/**
 * Handle the creation of an error when response status is no ok
 *
 * @param response {object}
 * @returns {Promise.<error>} throw a relevant exception
 */
GpgAuth.prototype.onResponseError = async function (response) {
  const error_msg = __('There was a server error. No additional information provided') + `(${response.status})`;
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
};

/**
 * Check if the user is authenticated.
 * @param {object} options Optional parameters
 * - options.requestApi {bool}, get the status from the API, default true.
 * @return {bool}
 */
GpgAuth.prototype.isAuthenticated = async function (options) {
  const authStatus = await this.checkAuthStatus(options);
  return authStatus.isAuthenticated;
};

/**
 * Check if the user needs to complete the MFA.
 *
 * @return {bool}
 */
GpgAuth.prototype.isMfaRequired = async function () {
  const authStatus = await this.checkAuthStatus();
  return authStatus.isMfaRequired;
};

/**
 * Request the server and retrieve the auth status.
 * @param {object} options Optional parameters
 * - options.requestApi {bool}, get the status from the API, default true.
 * @return {object}
 *  {
 *    isAuthenticated: {bool} true if the user is authenticated, false otherwise
 *    isMfaRequired: {bool} true if the mfa is required, false otherwise.
 *  }
 */
GpgAuth.prototype.checkAuthStatus = async function (options) {
  let isAuthenticated, isMfaRequired;
  // Define options.
  options = Object.assign({
    requestApi: true
  }, options);

  // No request to API required, return the latest stored information.
  if (!options.requestApi && GpgAuth._authStatus !== null) {
    return GpgAuth._authStatus;
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

  GpgAuth._authStatus = { isAuthenticated, isMfaRequired };

  return GpgAuth._authStatus;
};

/**
 * Start an invertval to check if the user is authenticated.
 * - In the case the user is logged out, trigger a passbolt.auth.logged-out event.
 *
 * @return {void}
 */
GpgAuth.prototype.startCheckAuthStatusLoop = async function () {
  const timeoutPeriod = await this.getCheckAuthStatusTimeoutPeriod();

  if (GpgAuth.checkAuthStatusTimeout) {
    clearTimeout(GpgAuth.checkAuthStatusTimeout);
  }

  GpgAuth.checkAuthStatusTimeout = setTimeout(async () => {
    if (!await this.isAuthenticated()) {
      const event = new Event('passbolt.auth.logged-out');
      window.dispatchEvent(event);
    } else {
      this.startCheckAuthStatusLoop();
    }
  }, timeoutPeriod);
};

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
GpgAuth.prototype.getCheckAuthStatusTimeoutPeriod = async function() {
  let timeoutPeriod = CHECK_IS_AUTHENTICATED_INTERVAL_PERIOD;

  // The entry point available before v2.11.0 extends the session expiry period.
  // Define the check interval based on the server session timeout.
  if (AuthService.useLegacyIsAuthenticatedEntryPoint === true) {
    const domain = User.getInstance().settings.getDomain();
    const siteSettings = new SiteSettings(domain);
    const settings = await siteSettings.get();
    // By default a default php session expires after 24 min.
    let sessionTimeout = 24;
    // Check if the session timeout is provided in the settings.
    // If not provided it means the user is not logged in or the MFA is required.
    if (settings && settings.app && settings.app.session_timeout) {
      sessionTimeout = settings.app.session_timeout;
    }
    // Convert the timeout in millisecond and add 1 second to ensure the session is well expired
    // when the request is made.
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
};

// Exports the Authentication model object.
exports.GpgAuth = GpgAuth;
