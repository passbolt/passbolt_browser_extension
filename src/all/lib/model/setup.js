/**
 * Setup model.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const { defer } = require('../sdk/core/promise');
var __ = require('../sdk/l10n').get;

var Config = require('./config');
var Keyring = require('./keyring').Keyring;
var Crypto = require('./crypto').Crypto;
var Auth = require('./auth').Auth;
var User = require('./user').User;

// var storage = require('../vendors/node-localstorage').localStorage;
// var jsonQ = require('../vendors/jsonQ').jsonQ;
// var Validator = require('../vendors/validator');
// var fetch = require('../vendors/window').fetch;
// var FormData = require('../vendors/window').FormData;

/**
 * The class that deals with keys.
 */
var Setup = function () {
  /**
   * Definition of setup object.
   *
   * @type {{user: {}, key: {}, settings: {}}}
   * @private
   */
  this._setup = {
    stepId: '',
    stepsHistory: '',
    user: {},
    key: {},
    settings: {
      token: '',
      domain: '',
      securityToken: {},
      armoredServerKey: ''
    }
  };

  this.storageKeyName = 'setup';
};

/**
 * Set setup variable in storage.
 *
 * @param key {string} The variable name
 * @param value {*} The variable value
 * @returns {*}
 */
Setup.prototype.set = function (key, value) {
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
 * Set setup variable in storage.
 *
 * @param key {string} The variable name
 * @returns {*} Empty if the variable is not found.
 * @todo empty should not be associated to not found variable.
 */
Setup.prototype.get = function (key) {
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
 * Go to the next setup step in the setup navigation.
 *
 * @param stepId {string} The step identifier
 * @returns {string} The step identifier
 */
Setup.prototype.navigationNext = function (stepId) {
  var currentStepId = this.get('stepId');
  var currentStepsHistory = this.get('stepsHistory');

  // If the same step is requested, we do nothing.
  if (stepId == currentStepId) {
    return stepId;
  }

  var steps = [];

  if (currentStepsHistory != '') {
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
 * @returns {string} The previous step identifier
 */
Setup.prototype.navigationBack = function () {

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
 * Get the navigation history.
 *
 * @returns {array}
 */
Setup.prototype.getNavigationHistory = function () {
  var currentStepsHistory = this.get('stepsHistory');
  if (currentStepsHistory == '') {
    return [];
  }
  return currentStepsHistory.split('/');
};

/**
 * Flush storage from setup data.
 */
Setup.prototype.flush = function () {
  storage.removeItem(this.storageKeyName);
};

/**
 * Reset the setup process.
 */
Setup.prototype.reset = function () {
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
 *
 * @param data {array} The setup date to save
 * @return {promise}
 */
Setup.prototype.save = function(data) {
  var _this = this,
    _response = {},
    deferred = defer();

  var url = data.settings.domain + '/users/validateAccount/' + data.user.id + '.json';
  var keyring = new Keyring();

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
  fetch(
    url, {
      method: 'PUT',
      credentials: 'include',
      body: JSON.stringify(requestData),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then(function(response) {
      _response = response;
      return response.json();
    })
    .then(function(json) {
      // Check response status
      if (!_response.ok || typeof json.header == 'undefined'
        || typeof json.header.status == 'undefined' || json.header.status != 'success') {
        return deferred.reject({
          message: 'server response error',
          data: {
            request: requestData,
            response: json
          }
        });
      } else {
        return _this.saveSettings(data);
      }
    })
    .then(
      function success() {
        deferred.resolve();
      },
      function error(error){
        deferred.reject(error);
      }
    )
    .catch(function(error){
      return deferred.reject(error);
    });

  return deferred.promise;
};

/**
 * Complete recovery process.
 * Inform server that the recovery is complete and save the recovered settings.
 *
 * @param data {array} The recovery data
 * @returns {promise}
 */
Setup.prototype.completeRecovery = function(data) {
  var _this = this,
    _response = {},
    deferred = defer();

  var url = data.settings.domain + '/setup/completeRecovery/' + data.user.id + '.json';

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
  fetch(
    url, {
      method: 'PUT',
      credentials: 'include',
      body: JSON.stringify(requestData),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then(function(response) {
      _response = response;
      return response.json();
    })
    .then(function(json) {
      // Check response status
      if (!_response.ok || typeof json.header == 'undefined'
        || typeof json.header.status == 'undefined' || json.header.status != 'success') {
        return deferred.reject({
          message: 'server response error',
          data: {
            request: requestData,
            response: json
          }
        });
      } else {
        return _this.saveSettings(data);
      }
    })
    .then(
      function success() {
        deferred.resolve();
      },
      function error(error){
        deferred.reject(error);
      }
    )
    .catch(function(error){
      return deferred.reject(error);
    });

  return deferred.promise;
};

/**
 * Save setup data into settings.
 *
 * @param setupData {setupData}
 * @returns {promise}
 */
Setup.prototype.saveSettings = function (setupData) {
  var deferred = defer(),
    keyring = new Keyring(),
    userInfo = null;

  // Save the user settings, e.g. security token & domain
  var user = new User();
  try {
    user.settings.setSecurityToken(setupData.settings.securityToken);
    // Save baseUrl.
    user.settings.setDomain(setupData.settings.domain);
    // Save user.
    userInfo = {
      id: setupData.user.id,
      username: setupData.user.username,
      firstname: setupData.user.firstname,
      lastname: setupData.user.lastname
    };
    user.set(userInfo);

  } catch (e) {
    deferred.reject({
      message: e.message,
      data: {
        token: setupData.settings.securityToken,
        domain: setupData.settings.domain,
        user: userInfo
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
  catch (e) {
    deferred.reject({
      message: 'error importing the server key : ' + e.message,
      data: {
        serverKey: setupData.settings.armoredServerKey
      }
    });
    return deferred.promise;
  }

  // Import private key into keyring.
  try {
    keyring.importPrivate(setupData.key.privateKeyArmored);
  }
  catch (e) {
    deferred.reject({
      message: 'error importing the private key : ' + e.message,
      data: {
        key: setupData.key.privateKeyArmored,
        userId: setupData.user.id
      }
    });
    return deferred.promise;
  }

  // Store the user public key in the keyring.
  // We store the one generated locally, not the one returned by the server.
  try {
    keyring.importPublic(setupData.key.publicKeyArmored, setupData.user.id);
  } catch (e) {
    deferred.reject({
      message: 'error importing the public key : ' + e.message,
      data: {
        key: setupData.key.publicKeyArmored,
        userId: setupData.user.id
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
 * We have a slightly different function that auth.verify, because at this stage none
 * of the data we are working with are in the keyring.
 *
 * @param userFingerprint {string} The user key finger print
 * @return {promise}
 */
Setup.prototype.checkKeyExistRemotely = function (userFingerprint) {
  var armoredServerKey = this.get('settings.armoredServerKey');
  var serverUrl = this.get('settings.domain');
  var gpgAuth = new Auth();
  return gpgAuth.verify(serverUrl, armoredServerKey, userFingerprint);
};

// Exports the Setup object.
exports.Setup = Setup;
