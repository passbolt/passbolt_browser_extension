/**
 * Auth model.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var __ = require('../sdk/l10n').get;
const defer = require('../sdk/core/promise').defer;
var Config = require('./config');
var User = require('./user').User;
var Keyring = require('./keyring').Keyring;
var Crypto = require('./crypto').Crypto;
var GpgAuthToken = require('./gpgAuthToken').GpgAuthToken;
var GpgAuthHeader = require('./gpgAuthHeader').GpgAuthHeader;

/**
 * GPGAuth authentication
 * @constructor
 */
var Auth = function () {
  this.URL_VERIFY = '/auth/verify.json'; // @TODO get from server http headers
  this.URL_LOGIN = '/auth/login.json';
  this._verifyToken = undefined;
};

/**
 * Verify the server identify
 *
 * @param serverUrl {string} The server url
 * @param serverKey {string} The server public armored key or keyid
 * @param userFingerprint {string} The user finger print
 * @returns {promise}
 */
Auth.prototype.verify = function(serverUrl, serverKey, userFingerprint) {
  var deferred = defer(),
    _this = this,
    user = new User();

  // if the server key is not provided get it from the settings
  if (typeof serverKey === 'undefined') {
    serverKey = Crypto.uuid(user.settings.getDomain());
  }
  if (typeof serverUrl === 'undefined') {
    serverUrl = user.settings.getDomain();
  }
  if (typeof userFingerprint === 'undefined') {
    var keyring = new Keyring(),
        privateKey = keyring.findPrivate();
    userFingerprint = privateKey.fingerprint;
  }

  var crypto = new Crypto();
  crypto.encrypt(this.__generateVerifyToken(), serverKey)
    .then(
      function success(encrypted) {
        var data = new FormData();
        data.append('data[gpg_auth][keyid]', userFingerprint);
        data.append('data[gpg_auth][server_verify_token]', encrypted);

        return fetch(
          serverUrl + _this.URL_VERIFY, {
            method: 'POST',
            credentials: 'include',
            body: data
          });
      },
      function error(error) {
        deferred.reject(new Error(__('Unable to encrypt the verify token.') + ' ' + error.message));
      }
    )
    .then(function(response) {
      // Check response status
      var auth = new GpgAuthHeader(response.headers, 'verify');

      // Check that the server was able to decrypt the token with our local copy
      var verify = new GpgAuthToken(auth.headers['x-gpgauth-verify-response']);
      if(verify.token != _this._verifyToken) {
        deferred.reject(new Error(__('The server was unable to prove its identity.')));
      } else {
        deferred.resolve(__('The server identity is verified!'));
      }
    })
    .catch(function(error) {
      deferred.reject(error);
    });

  return deferred.promise;
};

/**
 * Get Server key for GPG auth.
 *
 * @param domain {string} domain where to get the key. if domain is not
 *  provided, then look in the settings.
 *
 * @returns {promise}
 */
Auth.prototype.getServerKey = function (domain) {
  var deferred = defer(),
    user = new User(),
    _this = this;

  if (typeof domain === 'undefined') {
    domain = user.settings.getDomain();
  }

  fetch(
    domain + this.URL_VERIFY, {
      method: 'GET',
      credentials: 'include'
    })
    .then(function(response) {
      _this.__statusCheck(response);
      return response.json();
    })
    .then(
      function success(json) {
        deferred.resolve(json.body);
      },
      function error() {
        deferred.reject(new Error(
          __('There was a problem trying to understand the data provided by the server')));
      }
    )
    .catch(function(error) {
      deferred.reject(error);
    });

  return deferred.promise;
};

/**
 * GPGAuth Login - handle stage1, stage2 and complete
 *
 * @param passphrase {string} The user private key passphrase
 * @returns {promise}
 */
Auth.prototype.login = function(passphrase) {
  var deferred = defer(),
    _this = this,
    keyring = new Keyring();

  keyring.checkPassphrase(passphrase)
    .then(function() {
      return _this.__stage1(passphrase)
    })
    .then(function(userAuthToken) {
      return _this.__stage2(userAuthToken)
    })
    .then(function(referrer) {
      deferred.resolve(referrer);
    })
    .catch(function(error){
      var msg = __('The server was unable to respect the authentication protocol!') + ' ' + error.message;
      deferred.reject(new Error(msg));
    });

  return deferred.promise;
};

/**
 * GPGAuth stage1 - get and decrypt a verification given by the server
 *
 * @param passphrase {string} The user private key passphrase
 * @returns {promise}
 * @private
 */
Auth.prototype.__stage1 = function (passphrase) {
  var deferred = defer(),
    _this = this,
    user = new User(),
    keyring = new Keyring();

  var data = new FormData();
  data.append('data[gpg_auth][keyid]', (keyring.findPrivate()).fingerprint);

  // Stage 1. request a token to the server
  fetch(
    user.settings.getDomain() + this.URL_LOGIN, {
      method: 'POST',
      credentials: 'include',
      body : data
    })
    .then(function (response) {
      // Check response status
      _this.__statusCheck(response);
      var auth = new GpgAuthHeader(response.headers, 'stage1');

      // Try to decrypt the User Auth Token
      var crypto = new Crypto();
      var encryptedUserAuthToken = stripslashes(urldecode(auth.headers['x-gpgauth-user-auth-token']));
      return crypto.decrypt(encryptedUserAuthToken, passphrase);
    })
    .then(function(userAuthToken) {
      // Validate the User Auth Token
      var authToken = new GpgAuthToken(userAuthToken);
      deferred.resolve(authToken.token);
    })
    .catch(function(error){
      deferred.reject(error);
    });

  return deferred.promise;
};

/**
 * Stage 2. send back the token to the server to get auth cookie
 *
 * @param userAuthToken {string} The user authentication token
 * @returns {promise}
 * @private
 */
Auth.prototype.__stage2 = function (userAuthToken) {
  var deferred = defer(),
    _this = this,
    user = new User(),
    keyring = new Keyring();

  var data = new FormData();
  data.append('data[gpg_auth][keyid]', (keyring.findPrivate()).fingerprint);
  data.append('data[gpg_auth][user_token_result]', userAuthToken);

  fetch(
    user.settings.getDomain() + this.URL_LOGIN, {
      method: 'POST',
      credentials: 'include',
      body : data
    })
    .then(function(response) {
      // Check response status
      _this.__statusCheck(response);
      var auth = new GpgAuthHeader(response.headers, 'complete');

      // Get the redirection url
      var referrer = user.settings.getDomain() + auth.headers['x-gpgauth-refer'];
      deferred.resolve(referrer);
    })
    .catch(function(error){
      deferred.reject(error);
    });

  return deferred.promise;
};

/**
 * Generate random verification token to be decrypted by the server
 *
 * @returns {string}
 */
Auth.prototype.__generateVerifyToken = function() {
  var t = new GpgAuthToken();
  this._verifyToken = t.token;
  return this._verifyToken;
};

/**
 * Check if the HTTP status is OK.
 *
 * @param status {int} The http status
 * @returns {boolean}
 * @throw Exception if the status is not OK
 */
Auth.prototype.__statusCheck = function(response) {
  if(!response.ok) {
    var msg = __('There was a problem when trying to communicate with the server') + ' (HTTP Code:' + response.status +')'
    throw new Error(msg);
  }
  return true;
};

// Exports the Authentication model object.
exports.Auth = Auth;