/**
 * User model.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import UserService from "../service/api/user/userService";
import {Config} from "./config";
import UserSettings from "./userSettings/userSettings";
import ApiClientOptions from "../service/api/apiClient/apiClientOptions";
import Validator from "validator";
import {ValidatorRule} from "../utils/validatorRules";
import PassphraseStorageService from "../service/session_storage/passphraseStorageService";

/**
 * The class that deals with users.
 */
const User = (function() {
  // see model/settings
  this.settings = new UserSettings();

  // the fields
  this._user = {};

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
  this.validate = function(user, fields) {
    if (typeof fields === 'undefined') {
      fields = ['id', 'username', 'firstname', 'lastname'];
    }

    const errors = [];
    for (const i in fields) {
      const fieldName = fields[i];
      try {
        this.__validate(fieldName, user[fieldName]);
      } catch (e) {
        const fieldError = {};
        fieldError[fieldName] = e.message;
        errors.push(fieldError);
      }
    }

    if (errors.length > 0) {
      // Return exception with details in validationErrors.
      const e = new Error('user could not be validated');
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
  this.__validate = function(field, value) {
    switch (field) {
      case 'firstname':
        if (typeof value === 'undefined' || value === '') {
          throw new Error('The first name cannot be empty');
        }
        if (!ValidatorRule.isUtf8(value)) {
          throw new Error('The first name should be a valid UTF8 string');
        }
        if (!Validator.isLength(value, 0, 255)) {
          throw new Error('The first name length should be maximum 255 characters.');
        }
        break;
      case 'lastname':
        if (typeof value === 'undefined' || value === '') {
          throw new Error('The last name cannot be empty');
        }
        if (!ValidatorRule.isUtf8(value)) {
          throw new Error('The last name should be a valid UTF8 string');
        }
        if (!Validator.isLength(value, 0, 255)) {
          throw new Error('The last name length should be maximum 255 characters.');
        }
        break;
      case 'username':
        if (typeof value === 'undefined' || value === '') {
          throw new Error('The username cannot be empty');
        }
        /*
         * @deprecated the username could be validated using a custom application setting.
         * This validation will soon be removed as entities are validating content when the
         * user is retrieved from or saved in the local storage.
         */
        if (!ValidatorRule.isUtf8(value)) {
          throw new Error('The username should be a valid email address');
        }
        if (!Validator.isLength(value, 0, 255)) {
          throw new Error('The username length should be maximum 255 characters.');
        }
        break;
      case 'id':
        if (typeof value === 'undefined' || value === '') {
          throw new Error('The user id cannot be empty');
        }
        if (!Validator.isUUID(value)) {
          throw new Error('The user id should be a valid UUID');
        }
        break;
      default:
        throw new Error(`No validation defined for field: ${field}`);
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
  this.setName = function(firstname, lastname) {
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
  this.setUsername = function(username) {
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
  this.setId = function(id) {
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
  this.set = function(user) {
    if (typeof user === 'undefined') {
      throw new Error('The user cannot be empty');
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
  this.get = function(data) {
    try {
      if (typeof data !== 'undefined' && typeof data.user !== 'undefined') {
        this._getLocal(data.user);
      } else {
        this._getLocal();
      }
      const user = this._user;

      // Get settings according to data provided.
      if (typeof data !== 'undefined' && typeof data.user !== 'undefined' && typeof data.settings !== 'undefined') {
        user.settings = this.settings.get(data.settings);
      } else if (typeof data === 'undefined') {
        // If no data is provided, get everything.
        user.settings = this.settings.get();
      }

      return user;
    } catch (e) {
      throw new Error('The user is not set');
    }
  };

  /**
   * Get the current user from the local storage.
   * All data returned are validated once again.
   *
   * @param fields {array} The fields names to retrieve.
   * @return {object}
   * @throw Exception in case a data doesn't validate before being returned
   */
  this._getLocal = function(fields) {
    // Default data to return for user.
    const userDefaultFields = [
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
    for (const i in fields) {
      const varName = fields[i];
      this._user[varName] = Config.read(`user.${varName}`);

      try {
        this.__validate(varName, this._user[varName]);
      } catch (e) {
        this._user[varName] = {};
        throw new Error('The user is not set');
      }
    }

    return this._user;
  };

  /**
   * Check if the current user and its settings are valid
   *
   * @returns {boolean}
   */
  this.isValid = function() {
    try {
      this.get();
    } catch (e) {
      return false;
    }
    return this.settings.isValid();
  };

  /**
   * Retrieve and the store the user csrf token.
   * @return {Promise<void>}
   */
  this.retrieveAndStoreCsrfToken = async function() {
    // Don't use the getApiClientOptions. It will create a loop as it calls this method to retrieve the csrf token.
    const apiClientOptions = (new ApiClientOptions())
      .setBaseUrl(this.settings.getDomain());
    const userService = new UserService(apiClientOptions);
    const csrfToken = await userService.findCsrfToken();
    this.setCsrfToken(csrfToken);
  };

  /**
   * Get the user csrf token
   *
   * @return {string}
   */
  this.getCsrfToken = function() {
    return this._csrfToken;
  };

  /**
   * Get or fetch CSRF token if null
   *
   * @returns {Promise<string>}
   */
  this.getOrFetchCsrfToken = async function() {
    if (!this._csrfToken) {
      await this.retrieveAndStoreCsrfToken();
    }
    return this._csrfToken;
  };

  /**
   * Set the user csrf token
   *
   * @param {string} csrfToken The csrf token to set
   */
  this.setCsrfToken = function(csrfToken) {
    this._csrfToken = csrfToken;
  };

  /**
   * Return API Client options such as Domain and CSRF token
   * @param {object?} options (optional)
   * - requireCsrfToken {bool}: Should the csrf token should be set, default true
   * @return {ApiClientOptions} apiClientOptions
   */
  this.getApiClientOptions = async function(options) {
    options = Object.assign({
      requireCsrfToken: true,
    }, options);

    const apiClientOptions = (new ApiClientOptions())
      .setBaseUrl(this.settings.getDomain());

    if (options.requireCsrfToken) {
      apiClientOptions.setCsrfToken(await this.getOrFetchCsrfToken());
    }

    return apiClientOptions;
  };

  /**
   * Update the security token
   * @param token {{code: string, color: string, textColor: string}} The security token
   */
  this.updateSecurityToken = async function(token) {
    this.settings.setSecurityToken(token);
  };
});

const UserSingleton = (function() {
  let instance;

  function createInstance() {
    return new User();
  }

  return {
    getInstance: function() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    },

    init: function() {
      /*
       * Observe when the user session is terminated.
       * - Flush the temporary stored master password
       */
      self.addEventListener("passbolt.auth.after-logout", async() =>
        await PassphraseStorageService.flush()
      );
    }
  };
})();

export default UserSingleton;
