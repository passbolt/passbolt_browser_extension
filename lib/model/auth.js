/**
 * Auth model.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const { defer } = require('sdk/core/promise');
var Config = require('./config');
var User = require('./user').User;
var Request = require('./request').Request;
var Keyring = require('./keyring').Keyring;
var Crypto = require('./crypto').Crypto;
var GpgAuthToken = require('./gpgAuthToken.js').GpgAuthToken;
var GpgAuthHeader = require('./gpgAuthHeader.js').GpgAuthHeader;
var Validator = require('../vendors/validator');
const { urldecode, stripslashes } = require('../vendors/phpjs');
var __ = require('sdk/l10n').get;

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
 * Verify Server Identify
 * @returns {*}
 */
Auth.prototype.verify = function(serverUrl, serverKey) {
    var deferred = defer(),
        _this = this;
    var user = new User();
    var keyring = new Keyring();
    var crypto = new Crypto();
    var auth;
    var data = {};

    // if the server key is not provided get it from the settings
    if (typeof serverKey === 'undefined') {
        serverKey = Crypto.uuid(user.settings.getDomain());
    }
    if (typeof serverUrl === 'undefined') {
        serverUrl = user.settings.getDomain();
    }

    crypto.encrypt(this.__generateVerifyToken(), serverKey)
        .then(
            function success(encrypted) {
                data['data[gpg_auth][keyid]'] = (keyring.findPrivate()).fingerprint;
                data['data[gpg_auth][server_verify_token]'] = encrypted;
                return Request.post({
                    url: serverUrl + _this.URL_VERIFY,
                    content : data
                });
            }, function error(error) {
                return deferred.reject(new Error(__('Unable to encrypt the verify token.') + ' ' + error.message));
        })
        .then(function(response) {
            // Check response status
            _this.__statusCheck(response.status);
            auth = new GpgAuthHeader(response.headers);
            auth.validate('verify');

            // Check that the server was able to decrypt the token with our local copy
            var verify = new GpgAuthToken(auth.headers['x-gpgauth-verify-response']);
            if(verify.token != _this._verifyToken) {
                return deferred.reject(new Error(__('The server was unable to prove its identity.')));
            }

            return deferred.resolve(__('The server identity is verified!'));
        })
        .catch(function(error) {
            return deferred.reject(error);
        });

    return deferred.promise;
};

/**
 * Get Server key for GPG auth.
 *
 * @param domain
 *   domain where to get the key. if domain is not provided, then look in the settings.
 *
 * @returns {promise|json}
 */
Auth.prototype.getServerKey = function(domain) {
    var deferred = defer();
    var _this = this;
    var domain = typeof domain === 'undefined' ? user.settings.getDomain() : domain;

    Request.get({
        url: domain + this.URL_VERIFY
    })
    .then(function (response) {
        // Check response status
        _this.__statusCheck(response.status);

        // Try converting object to json
        var json = null;
        try {
            json = JSON.parse(response.text);
        } catch(e) {
            return deferred.reject(new Error(
                __('There was a problem trying to understand the data provided by the server')
                    + ' (Data:' + response.text +')'
            ));
        }
        return deferred.resolve(json.body);
    })
    .catch(function(error) {
        return deferred.reject(error);
    });

    return deferred.promise;
};

/**
 * GPGAuth Login - handle stage1, stage2 and complete
 * @returns {*}
 */
Auth.prototype.login = function(passphrase) {
    var deferred = defer(),
        _this = this;
    var keyring = new Keyring();
    keyring.checkPassphrase(passphrase)
        .then(function() {
            return _this.__stage1(passphrase)
        })
        .then(function(userAuthToken) {
            return _this.__stage2(userAuthToken)
        })
        .then(function(referrer) {
            return deferred.resolve(referrer);
        })
        .catch(function(error){
            var msg = __('The server was unable to respect the authentication protocol!') + ' ' + error.message;
            return deferred.reject(new Error(msg));
        });

    return deferred.promise;
};

/********************************************
 * PRIVATE METHODS
 ********************************************/
/**
 * GPGAuth stage1 - get and decrypt a verification given by the server
 * @param passphrase
 * @returns {*}
 * @private
 */
Auth.prototype.__stage1 = function (passphrase) {
    var deferred = defer(),
        _this = this;
    var auth;

    // Stage 1. request a token to the server
    var user = new User();
    var keyring = new Keyring();
    var data = {};
    data['data[gpg_auth][keyid]'] = (keyring.findPrivate()).fingerprint;

    Request.post({
        url: user.settings.getDomain() + this.URL_LOGIN,
        content: data
    })
    .then(function (response) {
        // Check response status
        _this.__statusCheck(response.status);
        auth = new GpgAuthHeader(response.headers);
        auth.validate('stage1');

        // Try to decrypt the User Auth Token
        var crypto = new Crypto();
        var encryptedUserAuthToken = stripslashes(urldecode(auth.headers['x-gpgauth-user-auth-token']));
        return crypto.decrypt(encryptedUserAuthToken, passphrase);
    })
    .then(function(userAuthToken) {
        // Validate the User Auth Token
        var authToken = new GpgAuthToken(userAuthToken);
        return deferred.resolve(authToken.token);
    })
    .catch(function(error){
        return deferred.reject(error);
    });

    return deferred.promise;
};

/**
 * Stage 2. send back the token to the server to get auth cookie
 * @param userAuthToken
 * @returns {*}
 * @private
 */
Auth.prototype.__stage2 = function (userAuthToken) {
    var deferred = defer();
    var data = {};
    var auth;
    var _this = this;
    var keyring = new Keyring();
    data['data[gpg_auth][keyid]'] = (keyring.findPrivate()).fingerprint;
    data['data[gpg_auth][user_token_result]'] = userAuthToken;

    var user = new User();
    var url = user.settings.getDomain() + this.URL_LOGIN;

    Request.post({
        url: url,
        content: data
    })
    .then(function (response) {
        // Check response status
        _this.__statusCheck(response.status);
        auth = new GpgAuthHeader(response.headers);
        auth.validate('complete');

        // Get the redirection url
        var referrer = user.settings.getDomain() + auth.headers['x-gpgauth-refer'];

        // Get the party started
        return deferred.resolve(referrer);
    })
    .catch(function(error){
      return deferred.reject(error);
    });

    return deferred.promise;
};

/**
 * Generate random verification token to be decrypted by the server
 * @returns {string}
 */
Auth.prototype.__generateVerifyToken = function() {
    var t = new GpgAuthToken();
    this._verifyToken = t.token;
    return this._verifyToken;
};

/**
 * Check if the HTTP status is OK
 * @param raw
 * @param deferred
 * @returns {*}
 */
Auth.prototype.__statusCheck = function(status) {
    if(status !== 200) {
        var msg = __('There was a problem when trying to communicate with the server') + ' (HTTP Code:' + raw.status +')'
        throw new Error(msg);
    }
    return true;
};

// Exports the Authentication model object.
exports.Auth = Auth;