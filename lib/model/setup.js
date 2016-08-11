/**
 * Setup model.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var openpgp = require('../vendors/openpgp');
var storage = new (require('../vendors/node-localstorage').LocalStorage)();
var jsonQ = require('../vendors/jsonQ').jsonQ;
var Request = require('sdk/request').Request;
const { defer } = require('sdk/core/promise');
var Config = require('./config');
var Keyring = require('./keyring').Keyring;
var Crypto = require('./crypto').Crypto;
var User = require('./user').User;
var Validator = require('../vendors/validator');
var __ = require("sdk/l10n").get;

/**
 * The class that deals with keys.
 */
var Setup = function() {
    /**
     * Definition of setup object.
     *
     * @type {{user: {}, key: {}, settings: {}}}
     * @private
     */
    this._setup = {
        stepId : '',
        stepsHistory : '',
        user : {},
        key : {},
        settings : {
            token : '',
            domain : '',
            securityToken : {},
            armoredServerKey: ''
        }
    };

    this.storageKeyName = 'setup';
};

/**
 * Set setup data in storage.
 *
 * @param key
 * @param value
 * @returns {*}
 */
Setup.prototype.set = function(key, value) {
    // Get last setup stored.
    var _setup = storage.getItem(this.storageKeyName);
    if (_setup == undefined || _setup == null) {
        _setup = JSON.parse(JSON.stringify(this._setup));
    }
    key = key.split(".");
    jsonQ.setPathValue(_setup, key, value);
    storage.setItem(this.storageKeyName, _setup);
    return _setup;
};

/**
 * Get setup data from storage.
 *
 * @param key
 *
 * @returns string
 *   value if found, or empty string if not found.
 */
Setup.prototype.get = function(key) {
    var _setup = storage.getItem(this.storageKeyName);
    if (_setup == null) {
        _setup = this._setup;
    }
    if (key == undefined) {
        return _setup;
    }
    key = key.split(".");
    var val = jsonQ.pathValue(_setup, key);
    if (val == undefined) {
        return '';
    }
    return val;
};

/**
 * Set Current step in the setup navigation.
 *
 * @param stepId
 */
Setup.prototype.navigationNext = function(stepId) {
    var currentStepId = this.get('stepId');
    var currentStepsHistory = this.get('stepsHistory');

    // If the same step is requested, we do nothing.
    if (stepId == currentStepId) {
        return stepId;
    }

    var steps = [];

    if (currentStepsHistory  != '') {
        steps = currentStepsHistory.split('/');
    }

    if (currentStepId != '') {
        steps.push(currentStepId);
    }

    this.set('stepId', stepId);
    this.set('stepsHistory', steps.join('/'));

    return stepId;
};

/**
 * Go back to previous step in the setup navigation.
 *
 * @returns {string}
 */
Setup.prototype.navigationBack = function() {

    var currentStepsHistory = this.get('stepsHistory');
    if (currentStepsHistory == '') {
        return '';
    }

    var stepsArr = currentStepsHistory.split('/');
    var lastStep = stepsArr.pop();
    var steps = (stepsArr.length == 0 ? '' : stepsArr.join('/'));

    this.set('stepId', lastStep);
    this.set('stepsHistory', steps);

    return lastStep;
};

/**
 * Get navigation history.
 *
 * @returns {*}
 */
Setup.prototype.getNavigationHistory = function() {
    var currentStepsHistory = this.get('stepsHistory');
    if (currentStepsHistory == '') {
        return [];
    }
    return currentStepsHistory.split('/');
};

/**
 * Flush storage from setup data.
 */
Setup.prototype.flush = function() {
    storage.deleteItem(this.storageKeyName);
};


/**
 * Initialize the setup process.
 */
Setup.prototype.reset = function() {
    // Delete user settings
    var user = new User();
    user.settings.flush();

    // Flush the keyring.
    var keyring = new Keyring();
    keyring.flush(Keyring.PUBLIC);
};

/**
 * Save setup data on the server.
 *
 * If server returns a positive response, then
 * proceed with plugin configuration.
 *  - Set user
 *  - Sync public key in keyring
 *  - Set domain and other settings
 */
Setup.prototype.save = function(data) {
    var self = this,
        deferred = defer(),
    // Build url.
        url = data.settings.domain + '/users/validateAccount/' + data.user.id + '.json',
    // Keyring.
        keyring = new Keyring();

    // Build request data.
    var requestData = {
        'AuthenticationToken': {
            'token': data.settings.token
        },
        'Gpgkey': {
            'key' : data.key.publicKeyArmored
        }
    };

    // Save the new password and other information.
    Request({
        url: url,
        content: requestData,
        onComplete: function (raw) {
            var response = JSON.parse(raw.text);
            if (typeof response.header == 'undefined'
                || typeof response.header.status == 'undefined'
                || response.header.status != 'success') {
                deferred.reject({
                    message:'server response error',
                    data: {
                        request: requestData,
                        response: response
                    }
                });
            }
            else {
                self.saveSettings(data)
                    .then(function success() {
                        deferred.resolve();
                    }, function error(){
                        deferred.reject(error);
                    });
            }
        }
    }).put();

    return deferred.promise;
};

/**
 * Complete recovery process.
 *
 * Inform server that the recovery is complete and
 * save settings.
 *
 * @param data
 * @returns {d.promise|promise|jQuery.Deferred.promise|jQuery.promise|promise.promise}
 */
Setup.prototype.completeRecovery = function(data) {
    var self = this,
        deferred = defer(),
    // Build url.
        url = data.settings.domain + '/setup/completeRecovery/' + data.user.id + '.json';

    // Build request data.
    var requestData = {
        'AuthenticationToken': {
            'token': data.settings.token
        },
        'Gpgkey': {
            'key' : data.key.publicKeyArmored
        }
    };

    // Save the new password and other information.
    Request({
        url: url,
        content: requestData,
        onComplete: function (raw) {
            var response = JSON.parse(raw.text);
            if (typeof response.header == 'undefined'
                || typeof response.header.status == 'undefined'
                || response.header.status != 'success') {
                deferred.reject({
                    message: 'server response error',
                    data: {
                        request: requestData,
                        response: response
                    }
                });
            }
            else {
               self.saveSettings(data)
                   .then(function success() {
                       deferred.resolve();
                   }, function error(){
                       deferred.reject(error);
                   });
            }
        }
    }).put();

    return deferred.promise;
};

/**
 * Save setup data into settings.
 *
 * @param setupData
 * @returns {d.promise|promise|jQuery.Deferred.promise|jQuery.promise|promise.promise}
 */
Setup.prototype.saveSettings = function(setupData) {
    var deferred = defer(),
        keyring = new Keyring();

    // Save the user settings, e.g. security token & domain
    var user = new User();
    try {
        user.settings.setSecurityToken(setupData.settings.securityToken);
        // Save baseUrl.
        user.settings.setDomain(setupData.settings.domain);
        // Save user.
        var userInfo = {
            id: setupData.user.id,
            username : setupData.user.username,
            firstname : setupData.user.firstname,
            lastname : setupData.user.lastname
        };
        user.set(userInfo);

    } catch (e) {
        deferred.reject({
            message: e.message,
            data: {
                token : setupData.settings.securityToken,
                domain : setupData.settings.domain,
                user : userInfo
            }
        });
        return deferred.promise;
    }

    // Flush the public keyring.
    keyring.flush(Keyring.PUBLIC);
    // Flush the private keyring.
    keyring.flush(Keyring.PRIVATE);

    // Import server key into keyring.
    try {
        keyring.importServerPublicKey(setupData.settings.armoredServerKey, setupData.settings.domain);
    }
    catch(e) {
        deferred.reject({
            message: 'error importing the server key : ' + e.message,
            data: {
                serverKey : setupData.settings.armoredServerKey
            }
        });
        return deferred.promise;
    }

    // Import private key into keyring.
    try {
        keyring.importPrivate(setupData.key.privateKeyArmored);
    }
    catch(e) {
        deferred.reject({
            message: 'error importing the private key : ' + e.message,
            data: {
                key : setupData.key.privateKeyArmored,
                userId : setupData.user.id
            }
        });
        return deferred.promise;
    }

    // Store the user public key in the keyring.
    // We store the one generated locally, not the one returned by the server.
    try {
        keyring.importPublic(setupData.key.publicKeyArmored, setupData.user.id);
    } catch(e) {
        deferred.reject({
            message: 'error importing the public key : ' + e.message,
            data: {
                key : setupData.key.publicKeyArmored,
                userId : setupData.user.id
            }
        });
        return deferred.promise;
    }

    // Everything alright, we resolve.
    deferred.resolve();
    return deferred.promise;
};


/**
 * Check if a key exist on the server.
 *
 * The check is based on the verify step of authentication.
 * We have a different function that auth.verify, because at this stage none
 * of the data we are working with are in the keyring.
 *
 * @param fingerprint
 */
Setup.prototype.checkKeyExistRemotely = function(fingerprint) {
  var Auth = require('./auth').Auth;
    var deferred = defer();
    var armoredServerKey = this.get('settings.armoredServerKey');
    var serverUrl = this.get('settings.domain');

    var data = {};
    data['data[gpg_auth][keyid]'] = fingerprint;

    var auth = new Auth();
    var tokenClear = auth.generateVerifyToken();
    Crypto.encrypt(armoredServerKey, tokenClear)
        .then (function(tokenEncrypted) {
            data['data[gpg_auth][server_verify_token]'] = tokenEncrypted;

            var url = serverUrl + auth.URL_VERIFY;
            Request({
                url: url,
                content : data,
                onComplete: function (raw) {

                    // Check the server headers and the general response shape
                    var healthcheck = auth.serverResponseHealthCheck('verify', raw, deferred);
                    if(healthcheck !== true) {
                        deferred.reject(__('The server response health check failed.'));
                        return deferred.promise;
                    }

                    // Check that the server was able to decrypt the token with our local copy
                    if(raw.headers['X-GPGAuth-Verify-Response'] != tokenClear) {
                        deferred.reject(__('The server was unable to prove his identity.'));
                        return deferred.promise;
                    }

                    deferred.resolve(__('The server identity is verified!'));
                }
            }).post();
        });

    return deferred.promise;
};

// Exports the Setup object.
exports.Setup = Setup;
