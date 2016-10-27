/**
 * User model.
 *|
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

const { defer } = require('sdk/core/promise');
var { setTimeout } = require("sdk/timers");
var Validator = require('../vendors/validator');
var Config = require("./config");
var Request = require("sdk/request").Request;
var Settings = require("./settings").Settings;
var __ = require("sdk/l10n").get;

// Will store temporarily the user master password if the user wants the
// system to remember it.
// Will be a json object with :
// - password: value of master password
// - created: timestamp when it was storeds
var _masterPassword = null;

/**
 * The class that deals with users.
 */
var User = function () {

  // see model/settings
  this.settings = new Settings();

  // reference to the user object returned by the server
  this._remote_user = {};

  // the fields
  this._user = {};

  // URLs
  this.URL_GET_REMOTE = '/users/me.json';
};

/**
 * Validate user fields individually
 * @param field {string} The name of the field to validate
 * @param value {string} The value of the field to validate
 * @returns {boolean}
 * @throw Error if the field is not valid
 * @private
 */
User.prototype.__validate = function (field, value) {
  switch (field) {
    case 'firstname':
      if (typeof value === 'undefined' || value === '') {
        throw new Error(__('The first name cannot be empty'));
      }
      if (!Validator.isAlphanumericSpecial(value)) {
        throw new Error(__('The first name should only contain alphabetical and numeric characters'))
      }
      break;
    case 'lastname' :
      if (typeof value === 'undefined' || value === '') {
        throw new Error(__('The last name cannot be empty'));
      }
      if (!Validator.isAlphanumericSpecial(value)) {
        throw new Error(__('The last name should only contain alphabetical and numeric characters'))
      }
      break;
    case 'username' :
      if (typeof value === 'undefined' || value === '') {
        throw new Error(__('The username cannot be empty'));
      }
      if (!Validator.isEmail(value)) {
        throw new Error(__('The username should be a valid email address'))
      }
      break;
    case 'id' :
      if (typeof value === 'undefined' || value === '') {
        throw new Error(__('The user id cannot be empty'));
      }
      if (!Validator.isUUID(value)) {
        throw new Error(__('The user id should be a valid UUID'))
      }
      break;
    default :
      throw new Error(__('No validation defined for field: ' + field));
      break;
  }
  return true;
};

/**
 * Validate a user.
 * @param user {object} The user to validate
 * @param fields {array} The names of the fields to validate
 * @returns {object} The user in case of success
 * @throw Error if the user is not valid
 */
User.prototype.validate = function (user, fields) {
  if (fields == undefined) {
    fields = ['id', 'username', 'firstname', 'lastname'];
  }

  var errors = [];
  for (var i in fields) {
    var fieldName = fields[i];
    try {
      this.__validate(fieldName, user[fieldName]);
    } catch (e) {
      var fieldError = {};
      fieldError[fieldName] = e.message;
      errors.push(fieldError);
    }
  }

  if (errors.length > 0) {
    // Return exception with details in validationErrors.
    var e = new Error(__('user could not be validated'));
    // Add validation errors to the error object.
    e.validationErrors = errors;
    throw e;
  }

  return user;
};

/**
 * Set a firstname and last name for the plugin user.
 * @param firstname {string} The user first name
 * @param lastname {string} The user last name
 * @return {bool}
 * @throw Error if the firsname or the lastname are not valid
 */
User.prototype.setName = function (firstname, lastname) {
  this.__validate('firstname', firstname);
  this.__validate('lastname', lastname);
  this._user.lastname = lastname;
  this._user.firstname = firstname;
  return (Config.write('user.firstname', firstname)
  && Config.write('user.lastname', lastname));
};

/**
 * Set a username for the plugin user.
 * @param username {string} The user username
 * @return {bool}
 * @throw Error if the username is not valid
 */
User.prototype.setUsername = function (username) {
  this.__validate('username', username);
  this._user.username = username;
  return (Config.write('user.username', username));
};

/**
 * Set the user id.
 * @param id {string} The user id
 * @return {bool}
 * @throw Error if the user id is not valid
 */
User.prototype.setId = function (id) {
  this.__validate('id', id);
  this._user.id = id;
  return (Config.write('user.id', id));
};

/**
 * Set the user.
 * @param user {object} The user to set
 * @return {object} The user
 * @throw Error if the user information are not valid
 */
User.prototype.set = function (user) {
  if (typeof user === 'undefined') {
    throw new Error(__('The user cannot be empty'));
  }
  this.setId(user.id);
  this.setUsername(user.username);
  this.setName(user.firstname, user.lastname);

  if (typeof user.settings !== 'undefined') {
    this.settings.set(user.settings);
  }

  return this._user;
};

/**
 * Get the user and validate values before returning them
 * @param fields {array} The fields to retrieve
 *   Example format :
 *   {
 *     user : ['firstname', 'lastname', 'username'],
 *     settings : ['domain', 'securityToken']
 *   }
 *
 *   Not providing this parameter will result in the function
 *   returning all the data known.
 * @return {object}
 * @throw Error if the user or the setting are not valid
 */
User.prototype.get = function (data) {
  try {

    if (data != undefined && data.user != undefined) {
      this._getLocal(data.user);
    }
    else {
      this._getLocal();
    }
    var user = this._user;

    // Get settings according to data provided.
    if (data != undefined && data.user != undefined && data.settings != undefined) {
      user.settings = this.settings.get(data.settings);
    }
    // If no data is provided, get everything.
    else if (data == undefined) {
      user.settings = this.settings.get();
    }

    return user;

  } catch (e) {
    throw new Error(__('The user is not set'));
  }
};

/**
 * Get the user name.
 * @return {object}
 * format :
 *   {
 *     firstname : 'FIRST_NAME',
 *     lastname : 'LAST_NAME'
 *   }
 */
User.prototype.getName = function () {
  var name = {
    firstname: Config.read('user.firstname'),
    lastname: Config.read('user.lastname')
  };
  return name;
};

/**
 * Get the username
 * @return {string}
 */
User.prototype.getUsername = function () {
  return Config.read('user.username');
};

/**
 * Get the current user from the local storage.
 * All data returned are validated once again.
 *
 * @param fields {array} The fields names to retrieve.
 * @return {object}
 * @throw Exception in case a data doesn't validate before being returned
 */
User.prototype._getLocal = function (fields) {
  // Default data to return for user.
  var userDefaultFields = [
    "id",
    "username",
    "firstname",
    "lastname"
  ];

  // If data is not provided as a parameter, we use default data.
  if (fields == undefined) {
    fields = userDefaultFields;
  }

  // For each user data requested, try to retrieve it and validate it.
  for (var i in fields) {
    var varName = fields[i];
    this._user[varName] = Config.read('user.' + varName);

    try {
      this.__validate(varName, this._user[varName]);
    } catch (e) {
      this._user[varName] = {};
      throw new Error(__('The user is not set'));
    }
  }

  return this._user;
};

/**
 * Get the user logged-in on the server.
 * @returns {promise}
 */
User.prototype._getRemote = function () {
  var deferred = defer(),
    self = this,
    url;

  //Check if there is a trusted domain
  try {
    // @TODO check that the user is logged in at that point
    url = self.settings.getDomain() + this.URL_GET_REMOTE;
  } catch (e) {
    deferred.reject(__('The application domain is not set'));
  }

  // Then get the current user from cache or server
  if (typeof this._remote_user !== 'undefined') {
    deferred.resolve(this._remote_user);
  } else {
    Request({
      url: url,
      onComplete: function (raw) {
        if (raw.status === '200') {
          var response = JSON.parse(raw.text);
          if (response.header.status == 'success') {
            self._remote_user = response.body;
            deferred.resolve(self._remote_user);
          } else {
            deferred.reject(response);
          }
        } else {
          deferred.reject();
        }
      }
    }).get();
  }
  return deferred.promise;
};

/**
 * Check if the current user and its settings are valid.
 * @returns {boolean}
 */
User.prototype.isValid = function () {
  // @TODO check if local and remote matches
  try {
    this.get();
  } catch (e) {
    return false;
  }
  return this.settings.isValid();
};

/**
 * Check if the current user is logged-in
 * @returns {promise}
 */
User.prototype.isLoggedIn = function () {
  var deferred = defer();

  Request({
    url: this.settings.getDomain() + '/auth/checkSession.json',
    onComplete: function (raw) {
      if (raw.status == 200) {
        deferred.resolve(__('The user is logged-in'));
      } else {
        deferred.reject();
      }
    }
  }).get();

  return deferred.promise;
};

/**
 * Store master password temporarily.
 * @param masterPassword {string} The master password to store.
 */
User.prototype.storeMasterPasswordTemporarily = function (masterPassword) {
  _masterPassword = {
    "password": masterPassword,
    "created": Math.round(new Date().getTime() / 1000.0)
  };
  var timeout = 5 * 60; // 5 minutes.
  this._loopDeleteMasterPasswordOnTimeout(timeout);
};

/**
 * Loop to be executed every second to check if the master password should be deleted.
 * @param timeout {int} timeout in seconds (example, if password should be
 *  deleted after 5 minutes, 5*60)
 * @private
 */
User.prototype._loopDeleteMasterPasswordOnTimeout = function (timeout) {
  var self = this;
  var currentTimestamp = Math.round(new Date().getTime() / 1000.0);
  if (currentTimestamp >= _masterPassword.created + timeout) {
    _masterPassword = null;
  }
  else {
    setTimeout(function () {
      self._loopDeleteMasterPasswordOnTimeout(timeout);
    }, 1000);
  }
};

/**
 * Retrieve master password from memory, in case it was stored temporarily
 * by the user.
 * @returns {promise}
 */
User.prototype.getStoredMasterPassword = function () {
  var deferred = defer();
  if (_masterPassword !== null) {
    deferred.resolve(_masterPassword.password);
  }
  else {
    deferred.reject();
  }

  return deferred.promise;
};

// Exports the User object.
exports.User = User;