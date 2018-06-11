"use strict";
/**
 * GpgAuth model.
 *
 * @copyright (c) 2018 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const __ = require('../sdk/l10n').get;
const User = require('./user').User;
const Keyring = require('./keyring').Keyring;
const Crypto = require('./crypto').Crypto;
const Uuid = require('../utils/uuid');
const GpgAuthToken = require('./gpgAuthToken').GpgAuthToken;
const GpgAuthHeader = require('./gpgAuthHeader').GpgAuthHeader;

const URL_VERIFY = '/auth/verify.json?api-version=v1';
const URL_LOGIN = '/auth/login.json?api-version=v1';

/**
 * GPGAuth authentication
 * @constructor
 */
let GpgAuth = function () {
  this.keyring = new Keyring();
};

/**
 * Alias for User settings get domain
 *
 * @throws Error if domain is undefined
 * @returns {string}
 */
GpgAuth.prototype.getDomain = function() {
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
GpgAuth.prototype.verify = async function(serverUrl, armoredServerKey, userFingerprint) {
  let domain = serverUrl || this.getDomain();
  let serverKey = armoredServerKey || Uuid.get(domain);
  let fingerprint = userFingerprint || this.keyring.findPrivate().fingerprint;

  // Encrypt a random token
  const crypto = new Crypto();
  let encrypted, originalToken;
  try {
    originalToken = new GpgAuthToken();
    encrypted = await crypto.encrypt(originalToken.token, serverKey)
  } catch(error) {
    throw new Error(__('Unable to encrypt the verify token.') + ' ' + error.message);
  }

  // Prepare the request data
  const data = new FormData();
  data.append('data[gpg_auth][keyid]', fingerprint);
  data.append('data[gpg_auth][server_verify_token]', encrypted);

  // Send the data
  const response = await fetch(domain + URL_VERIFY, {
    method: 'POST',
    credentials: 'include',
    body: data
  });

  // If the server responded with an error build a relevant message
  if(!response.ok) {
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
  if(verifyToken.token !== originalToken.token) {
    throw new Error(__('The server was unable to prove it can use the advertised OpenPGP key.'));
  }
};

/**
 * Get Server key for GPG auth.
 *
 * @param serverUrl {string} domain where to get the key. if domain is not
 *  provided, then look in the settings.
 *
 * @returns {Promise.<string>}
 */
GpgAuth.prototype.getServerKey = async function (serverUrl) {
  let domain = serverUrl || this.getDomain();
  const response = await fetch(domain + URL_VERIFY, {
    method: 'GET',
    credentials: 'include'
  });

  if(!response.ok) {
    const msg = __('There was a problem when trying to communicate with the server') + ` (Code: ${response.status})`;
    throw new Error(msg);
  }

  const json = await response.json();
  return json.body;
};

/**
 * GPGAuth Login - handle stage1, stage2 and complete
 *
 * @param passphrase {string} The user private key passphrase
 * @returns {Promise.<string>} referrer url
 */
GpgAuth.prototype.login = async function(passphrase) {
    await this.keyring.checkPassphrase(passphrase);
    const userAuthToken = await this.stage1(passphrase);
    return await this.stage2(userAuthToken);
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
  const data = {
    method: 'POST',
    credentials: 'include',
    body: body
  };

  // Send request token to the server
  const response = await fetch(url, data);
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
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    body: data
  });

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
  } catch(error) {
    throw new Error(error_msg);
  }
  if (typeof json.header !== 'undefined') {
    throw new Error(json.header.message);
  }
  throw new Error(error_msg);
};

// Exports the Authentication model object.
exports.GpgAuth = GpgAuth;