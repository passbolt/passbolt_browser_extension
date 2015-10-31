const { defer } = require('sdk/core/promise');
var Request = require("sdk/request").Request;
var User = require("./user").User;
var Keyring = require("./keyring").Keyring;
var Crypto = require("./crypto").Crypto;
var Config = require("./config");
var Validator = require('../vendors/validator');
var __ = require("sdk/l10n").get;

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
 * Generate random verification token to be decrypted by the server
 * @returns {string}
 */
Auth.prototype.generateVerifyToken = function () {
    var token = 'gpgauthv1.3.0|36|';
    token += Crypto.uuid();
    token += '|gpgauthv1.3.0';
    this._verifyToken = token;
    return token;
};

/**
 * Validate the user auth token returned by the server
 * @param userAuthToken
 * @returns {boolean}
 */
Auth.prototype.validateAuthToken = function(userAuthToken) {
    if(typeof userAuthToken === 'undefined' || userAuthToken === '') {
        throw new Error(__('The user authentication token cannot be empty'));
    }
    var sections = userAuthToken.split('|');
    if (sections.length !== 4) {
        throw new Error(__('The user authentication token is not in the right format'));
    }
    if (sections[0] !== sections[3] && sections[0] !== 'gpgauthv1.3.0') {
        throw new Error(__('Passbolt does not support this GPGAuth version'));
    }
    if (sections[1] !== '36') {
        throw new Error(__('Passbolt does not support GPGAuth token nonce longer than 36 characters: ' + sections[2]));
    }
    if (!Validator.isUUID(sections[2])) {
        throw new Error(__('Passbolt does not support GPGAuth token nonce that are not UUIDs'));
    }
    return true;
};

/**
 * Validate the GPGAuth custom HTTP headers of the server response
 * @param stage
 * @param headers
 * @returns {boolean}
 */
Auth.prototype.validateHeaders = function (stage, headers) {

    if(typeof headers === 'undefined') {
        throw new Error(__('No GPGAuth headers set.'))
    }
    if(typeof headers['X-GPGAuth-Version'] !== 'string' ||
        headers['X-GPGAuth-Version'] != '1.3.0') {
        throw new Error(__('That version of GPGAuth is not supported. (' + headers['X-GPGAuth-Version'] + ')'));
    }

    switch(stage) {
        case 'verify' :
        case 'stage0' :
            if(typeof headers['X-GPGAuth-Authenticated'] !== 'string' ||
                headers['X-GPGAuth-Authenticated'] != 'false') {
                throw new Error(__('X-GPGAuth-Authenticated should be set to false during the verify stage'));
            }
            if(typeof headers['X-GPGAuth-Progress'] !== 'string' ||
                headers['X-GPGAuth-Progress'] != 'stage0') {
                throw new Error(__('X-GPGAuth-Progress should be set to stage0 during the verify stage'));
            }
            if(typeof headers['X-GPGAuth-User-Auth-Token'] !== 'undefined') {
                throw new Error(__('X-GPGAuth-User-Auth-Token should not be set during the verify stage' +
                    typeof headers['X-GPGAuth-User-Auth-Token']));
            }
            if(typeof headers['X-GPGAuth-Verify-Response'] !== 'string') {
                throw new Error(__('X-GPGAuth-Verify-Response should be set during the verify stage'));
            }
            if(typeof headers['X-GPGAuth-Refer'] !== 'undefined') {
                throw new Error(__('X-GPGAuth-Refer should not be set during verify stage'));
            }
        break;

        case 'stage1' :
            if(typeof headers['X-GPGAuth-Authenticated'] !== 'string' ||
                headers['X-GPGAuth-Authenticated'] != 'false') {
                throw new Error(__('X-GPGAuth-Authenticated should be set to false during stage1'));
            }
            if(typeof headers['X-GPGAuth-Progress'] !== 'string' ||
                headers['X-GPGAuth-Progress'] != 'stage1') {
                throw new Error(__('X-GPGAuth-Progress should be set to stage1'));
            }
            if(typeof headers['X-GPGAuth-User-Auth-Token'] === 'undefined') {
                throw new Error(__('X-GPGAuth-User-Auth-Token should be set during stage1'));
            }
            if(typeof headers['X-GPGAuth-Verify-Response'] !== 'undefined') {
                throw new Error(__('X-GPGAuth-Verify-Response should not be set during stage1'));
            }
            if(typeof headers['X-GPGAuth-Refer'] !== 'undefined') {
                throw new Error(__('X-GPGAuth-Refer should not be set during stage1'));
            }
            return true;

        case 'stage2' :
            if(typeof headers['X-GPGAuth-Authenticated'] !== 'string' ||
                headers['X-GPGAuth-Authenticated'] != 'false') {
                throw new Error(__('X-GPGAuth-Authenticated should be set to false during stage2'));
            }
            if(typeof headers['X-GPGAuth-Progress'] !== 'string' ||
                headers['X-GPGAuth-Progress'] != 'stage2') {
                throw new Error(__('X-GPGAuth-Progress should be set to stage2'));
            }
            if(typeof headers['X-GPGAuth-User-Auth-Token'] !== 'undefined') {
                throw new Error(__('X-GPGAuth-User-Auth-Token should not be set during stage2'));
            }
            if(typeof headers['X-GPGAuth-Verify-Response'] !== 'undefined') {
                throw new Error(__('X-GPGAuth-Verify-Response should not be set during stage2'));
            }
            if(typeof headers['X-GPGAuth-Refer'] !== 'undefined') {
                throw new Error(__('X-GPGAuth-Refer should not be set during stage2'));
            }
            return true;

        case 'complete':
            if(typeof headers['X-GPGAuth-Authenticated'] !== 'string' ||
                headers['X-GPGAuth-Authenticated'] != 'true') {
                throw new Error(__('X-GPGAuth-Authenticated should be set to true when GPGAuth is complete'));
            }
            if(typeof headers['X-GPGAuth-Progress'] !== 'string' ||
                headers['X-GPGAuth-Progress'] != 'complete') {
                throw new Error(__('X-GPGAuth-Progress should be set to complete during final stage'));
            }
            if(typeof headers['X-GPGAuth-User-Auth-Token'] !== 'undefined') {
                throw new Error(__('X-GPGAuth-User-Auth-Token should not be set during final stage'));
            }
            if(typeof headers['X-GPGAuth-Verify-Response'] !== 'undefined') {
                throw new Error(__('X-GPGAuth-Verify-Response should not be set during final stage'));
            }
            if(typeof headers['X-GPGAuth-Refer'] !== 'string') {
                throw new Error(__('X-GPGAuth-Refer should be set during final stage'));
            }
            return true;

        default:
            throw new Error(__('Unknown GPGAuth stage'));
            return false;
    }
};

/**
 * Check if the response from the server is looking as per the GPGAuth protocol
 * @param raw response
 * @param deferred promise
 * @returns true or promise if reject
 */
Auth.prototype.serverResponseHealthCheck = function(step, raw, deferred) {
    var error_msg;

    // Check if the HTTP status is OK
    if(raw.status !== 200) {
        deferred.reject(__('There was a problem when trying to communicate with the server') +
        ' (HTTP Code:' + raw.status +')');
        return deferred.promise;
    }

    // Check if there is GPGAuth error flagged by the server
    if(typeof raw.headers['X-GPGAuth-Error'] !== 'undefined') {
        error_msg = (Config.isDebug()) ?
            raw.headers['X-GPGAuth-Debug'] :
            __('The server rejected the verification request.');
        deferred.reject(error_msg);
        return deferred.promise;
    }

    // Check if the headers are correct
    try {
        this.validateHeaders(step, raw.headers);
    } catch (e) {
        error_msg = (Config.isDebug()) ?
            e.message :
            __('The server was unable to respect the authentication protocol.');
        deferred.reject(error_msg);
        return deferred.promise;
    }

    return true;
};

/**
 * Verify Server Identify
 * @returns {*}
 */
Auth.prototype.verify = function() {
    var deferred = defer(),
        self = this;
    var user = new User();
    var keyring = new Keyring();
    var crypto = new Crypto();

    // @TODO check that the key advertised by the server is the one we have in store
    var data = {};
    data['data[gpg_auth][keyid]'] = (keyring.findPrivate()).fingerprint;
    data['data[gpg_auth][server_verify_token]'] = crypto.encrypt(
        this.generateVerifyToken(),
        Crypto.uuid(user.settings.getDomain())
    );

    var url = user.settings.getDomain() + this.URL_VERIFY;
    Request({
        url: url,
        content : data,
        onComplete: function (raw) {

            // Check the server headers and the general response shape
            var healthcheck = self.serverResponseHealthCheck('verify', raw, deferred);
            if(healthcheck !== true) {
                return deferred.promise;
            }

            // Check that the server was able to decrypt the token with our local copy
            if(raw.headers['X-GPGAuth-Verify-Response'] != self._verifyToken) {
                deferred.reject(__('The server was unable to prove his identity.'));
                return deferred.promise;
            }

            deferred.resolve(__('The server identity is verified!'));
            return deferred.promise;
        }
    }).post();

    return deferred.promise;
};

/**
 * GPGAuth Login - handle stage1, stage2 and complete
 * @returns {*}
 */
Auth.prototype.login = function(passphrase) {
    var deferred = defer(),
        self = this;
    var keyring = new Keyring();
    var crypto = new Crypto();

    // Make sure the master password is correct
    if (!keyring.checkPassphrase(passphrase)) {
        deferred.reject(__('The master password you entered is not valid'));
    }

    // @TODO use the same deferred
    this._stage1(passphrase).then(
        function success(userAuthToken) {
            self._stage2(userAuthToken).then(
                function success(referrer) {
                    deferred.resolve(referrer);
                },
                function error(msg) {
                    deferred.reject(__(msg));
                }
            );
        },
        function error(error) {
            deferred.reject(error);
        }
    );

    return deferred.promise;
};

/**
 * GPGAuth stage1 - get and decrypt a verification given by the server
 * @param passphrase
 * @returns {*}
 * @private
 */
Auth.prototype._stage1 = function (passphrase) {
    var deferred = defer(),
        self = this;
    var debug;

    // Stage 1. request a token to the server
    var data = {};
    var keyring = new Keyring();
    data['data[gpg_auth][keyid]'] = (keyring.findPrivate()).fingerprint;
    var user = new User();
    var url = user.settings.getDomain() + this.URL_LOGIN;

    Request({
        url: url,
        content : data,
        onComplete: function (raw) {

            // Check the server headers and the general response shape
            var healthcheck = self.serverResponseHealthCheck('stage1', raw, deferred);
            if(healthcheck !== true) {
                return deferred.promise;
            }

            // Try to decrypt the User Auth Token
            var userAuthToken;
            try {
                const { urldecode, stripslashes } = require('../vendors/phpjs');
                var encryptedUserAuthToken = stripslashes(urldecode(raw.headers['X-GPGAuth-User-Auth-Token']));
                var crypto = new Crypto();
                userAuthToken = crypto.decrypt(encryptedUserAuthToken, passphrase);
            } catch (e) {
                deferred.reject(e.message);
                return deferred.promise;
            }

            // Validate the User Auth Token
            try {
                self.validateAuthToken(userAuthToken);
                deferred.resolve(userAuthToken);
            } catch (e) {
                debug = (Config.isDebug()) ?
                    e.message :
                    __('The server was unable to respect the authentication protocol!');
                deferred.reject(debug);
            }
        }
    }).post();

    return deferred.promise;
};

/**
 * Stage 2. send back the token to the server to get auth cookie
 * @param userAuthToken
 * @returns {*}
 * @private
 */
Auth.prototype._stage2 = function (userAuthToken) {
    var deferred = defer();
    var data = {};
    var self = this;
    var keyring = new Keyring();
    data['data[gpg_auth][keyid]'] = (keyring.findPrivate()).fingerprint;
    data['data[gpg_auth][user_token_result]'] = userAuthToken;

    var user = new User();
    var url = user.settings.getDomain() + this.URL_LOGIN;

    Request({
        url: url,
        content : data,
        onComplete: function (raw) {

            // Check the server headers and the general response shape
            var healthcheck = self.serverResponseHealthCheck('complete', raw, deferred);
            if(healthcheck !== true) {
                return deferred.promise;
            }

            // Get the redirection url
            var user = new User();
            var referrer = user.settings.getDomain() + raw.headers['X-GPGAuth-Refer'];

            // Get the party started
            deferred.resolve(referrer);
        }
    }).post();
    return deferred.promise;
};

// Exports the Authentication model object.
exports.Auth = Auth;