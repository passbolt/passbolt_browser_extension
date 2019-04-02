"use strict";
/**
 * User model.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const Config = require('./config');
const MfaAuthenticationRequiredError = require('../error/mfaAuthenticationRequiredError').MfaAuthenticationRequiredError;
const UserSettings = require('./userSettings').UserSettings;
const __ = require('../sdk/l10n').get;

/**
 * The class that deals with users.
 */
const User = (function () {

  // see model/settings
  this.settings = new UserSettings();

  // the fields
  this._user = {};

 /*
  * _masterpassword be a json object with :
  * - password: value of master password
  * - created: timestamp when it was stored
  * - timeout: interval function
  */
  this._masterPassword = null;

  /*
   * _csrfToken The user current csrf token.
   */
  this._csrfToken = null;

  /**
   * Validate a user
   *
   * @param user {object} The user to validate
   * @param fields {array} The names of the fields to validate
   * @returns {object} The user in case of success
   * @throw Error if the user is not valid
   */
  this.validate = function (user, fields) {
    if (typeof fields === 'undefined') {
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
   * Validate user fields individually
   *
   * @param field {string} The name of the field to validate
   * @param value {string} The value of the field to validate
   * @returns {boolean}
   * @throw Error if the field is not valid
   * @private
   */
  this.__validate = function (field, value) {
    switch (field) {
      case 'firstname':
        if (typeof value === 'undefined' || value === '') {
          throw new Error(__('The first name cannot be empty'));
        }
        if (!Validator.isUtf8(value)) {
          throw new Error(__('The first name should be a valid UTF8 string'))
        }
        if (!Validator.isLength(value, 0, 255)) {
          throw new Error(__('The first name length should be maximum 255 characters.'))
        }
        break;
      case 'lastname' :
        if (typeof value === 'undefined' || value === '') {
          throw new Error(__('The last name cannot be empty'));
        }
        if (!Validator.isUtf8(value)) {
          throw new Error(__('The last name should be a valid UTF8 string'))
        }
        if (!Validator.isLength(value, 0, 255)) {
          throw new Error(__('The last name length should be maximum 255 characters.'))
        }
        break;
      case 'username' :
        if (typeof value === 'undefined' || value === '') {
          throw new Error(__('The username cannot be empty'));
        }
        if (!Validator.isEmail(value)) {
          throw new Error(__('The username should be a valid email address'))
        }
        if (!Validator.isLength(value, 0, 255)) {
          throw new Error(__('The username length should be maximum 255 characters.'))
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
   * Set a firstname and last name for the plugin user
   *
   * @param firstname {string} The user first name
   * @param lastname {string} The user last name
   * @return {bool}
   * @throw Error if the firsname or the lastname are not valid
   */
  this.setName = function (firstname, lastname) {
    this.__validate('firstname', firstname);
    this.__validate('lastname', lastname);
    this._user.lastname = lastname;
    this._user.firstname = firstname;
    return (Config.write('user.firstname', firstname)
    && Config.write('user.lastname', lastname));
  };

  /**
   * Set a username for the plugin user
   *
   * @param username {string} The user username
   * @return {bool}
   * @throw Error if the username is not valid
   */
  this.setUsername = function (username) {
    this.__validate('username', username);
    this._user.username = username;
    return (Config.write('user.username', username));
  };

  /**
   * Set the user id
   *
   * @param id {string} The user id
   * @return {bool}
   * @throw Error if the user id is not valid
   */
  this.setId = function (id) {
    this.__validate('id', id);
    this._user.id = id;
    return (Config.write('user.id', id));
  };

  /**
   * Set the user
   *
   * @param user {object} The user to set
   * @return {object} The user
   * @throw Error if the user information are not valid
   */
  this.set = function (user) {
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
   *
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
  this.get = function (data) {
    try {

      if (typeof data !== 'undefined' && typeof data.user !== 'undefined') {
        this._getLocal(data.user);
      }
      else {
        this._getLocal();
      }
      var user = this._user;

      // Get settings according to data provided.
      if (typeof data !== 'undefined' && typeof data.user !== 'undefined' && typeof data.settings !== 'undefined') {
        user.settings = this.settings.get(data.settings);
      }
      // If no data is provided, get everything.
      else if (typeof data === 'undefined') {
        user.settings = this.settings.get();
      }

      return user;

    } catch (e) {
      throw new Error(__('The user is not set'));
    }
  };

  /**
   * Get the user name
   *
   * @return {object}
   * format :
   *   {
   *     firstname : 'FIRST_NAME',
   *     lastname : 'LAST_NAME'
   *   }
   */
  this.getName = function () {
    var name = {
      firstname: Config.read('user.firstname'),
      lastname: Config.read('user.lastname')
    };
    return name;
  };

  /**
   * Get the username
   *
   * @return {string}
   */
  this.getUsername = function () {
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
  this._getLocal = function (fields) {
    // Default data to return for user.
    var userDefaultFields = [
      "id",
      "username",
      "firstname",
      "lastname"
    ];

    // If data is not provided as a parameter, we use default data.
    if (typeof fields === 'undefined') {
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
   * Check if the current user and its settings are valid
   *
   * @returns {boolean}
   */
  this.isValid = function () {
    try {
      this.get();
    } catch (e) {
      return false;
    }
    return this.settings.isValid();
  };

  /**
   * Check if the current user is logged-in
   *
   * @returns {Promise}
   */
  this.isLoggedIn = function () {
    var _this = this;

    return new Promise(function(resolve, reject) {
      fetch(
        _this.settings.getDomain() + '/auth/checkSession.json' + '?api-version=v1', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
        .then(function (response) {
          // Check response status
          if (!response.ok) {
            if (/mfa\/verify\/error\.json$/.test(response.url)) {
              reject(new MfaAuthenticationRequiredError());
            } else {
              reject(new Error(__('The user is not logged-in')));
            }
          } else {
            resolve(__('The user is logged-in'));
          }
        })
        .catch(function (error) {
          reject(error);
        });
    });
  };

  /**
   * Store master password temporarily.
   *
   * @param masterPassword {string} The master password to store.
   */
  this.storeMasterPasswordTemporarily = function (masterPassword, seconds) {
    this._masterPassword = {
      "password": masterPassword,
      "created": Math.round(new Date().getTime() / 1000.0)
    };
    this._loopDeleteMasterPasswordOnTimeout(seconds);
  };

  /**
   * Store csrf token.
   *
   * @param csrfToken {string} The csrf token.
   */
  this.storeCsrfToken = function (csrfToken) {
    this._csrfToken = csrfToken;
  };

  /**
   * Get stored csrf token
   *
   * @return {string}
   */
  this.getCsrfToken = function() {
    return this._csrfToken;
  };

  /**
   * Loop to be executed every second to check if the master password should be deleted.
   *
   * @param timeout {int} timeout in seconds (example, if password should be
   *  deleted after 5 minutes, 5*60)
   * @private
   */
  this._loopDeleteMasterPasswordOnTimeout = function (timeout) {
    var interval = 1000 * 10; // check every 10 sec then increase
    var maxInterval = (1000 * 60 * 60); // check every hour
    var self = this;

    this.isLoggedIn()
      .then(function() {
        if (interval < maxInterval) {
          // increase check interval to allow autologout
          // max 1hour, if session timout is set to > 60min remember me is forever
          // default session length without action is 20min
          interval = interval + interval;
          if (interval > maxInterval) {
            interval = maxInterval;
          }
        }
        var currentTimestamp = Math.round(new Date().getTime() / 1000.0);
        if (timeout <= 0) {
          // The user is logged-in and timout is set to until I logout, keep remembering.
          self._masterPassword.timout = setTimeout(function () {
            self._loopDeleteMasterPasswordOnTimeout(timeout);
          }, interval);
        } else if (currentTimestamp >= self._masterPassword.created + timeout) {
          // The user is logged-in and timeout expired, reset master password.
          self._masterPassword = null;
        } else {
          // The user is logged-in and timeout did not expire, keep remembering master password.
          self._masterPassword.timout = setTimeout(function () {
            self._loopDeleteMasterPasswordOnTimeout(timeout);
          }, interval);
        }
      }, function() {
        // The user is not logged-in, reset master password.
        self._masterPassword = null;
      });
  };

  /**
   * Check if the master password is stored.
   * @return {boolean}
   */
  this.isMasterPasswordStored = function() {
    return this._masterPassword !== null;
  }

  /**
   * Retrieve master password from memory, in case it was stored temporarily
   * by the user.
   * @returns {Promise}
   */
  this.getStoredMasterPassword = function () {
    return new Promise ((resolve, reject) => {
      if (this.isMasterPasswordStored()) {
        resolve(this._masterPassword.password);
      } else {
        reject(new Error(__('No master password stored.')));
      }
    });
  };

  /**
   * Flush the master password if any stored during a previous session
   */
  this.flushMasterPassword = function () {
    this._masterPassword = null;
  };

  /**
   * Search users by keywords
   *
   * @param keywords
   * @param excludedUsers
   * @return {Promise.<array>} array of users
   */
  this.searchUsers = async function(keywords, excludedUsers) {

    // Prepare url and data
    const url = this.settings.getDomain() + '/users.json'
      + '?api-version=v1' + '&filter[keywords]=' + htmlspecialchars(keywords, 'ENT_QUOTES') + '&filter[is-active]=1';
    const data = {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };
    const response = await fetch(url, data);
    const json = await response.json();

    // Check response status
    if (!response.ok) {
      let msg = __('Could not get the users. The server responded with an error.');
      if (typeof json.headers.msg !== 'undefined') {
        msg += ` ${json.headers.msg}`;
      }
      msg += ` (${response.status})`;
      throw new Error(msg);
    }

    // Build the user list
    const users = json.body;
    let finalUsers = [];
    for (var i in users) {
      if (!in_array(users[i].User.id, excludedUsers)) {
        finalUsers.push(users[i]);
      }
    }
    return finalUsers;
  };
});

var UserSingleton = (function () {
  var instance;

  function createInstance() {
    var object = new User();
    return object;
  }

  return {
    getInstance: function () {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();

// Exports the User object.
exports.User = UserSingleton;
