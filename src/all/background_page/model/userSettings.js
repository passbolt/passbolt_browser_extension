/**
 * UserSettings model.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var __ = require('../sdk/l10n').get;
var Config = require('./config');

/**
 * The class that deals with users settings
 */
var UserSettings = function () {
};

/**
 * Sanity check on user settings.
 * @return {boolean}
 */
UserSettings.prototype.isValid = function () {
  try {
    this.getSecurityToken();
    this.getDomain();
  } catch (e) {
    return false;
  }
  return true;
};

/**
 * Validate settings fields individually.
 * @param field {string} The field name
 * @param value {*} The field value
 * @returns {boolean}
 * @private
 * @throw Error if the field is not valid
 */
UserSettings.prototype.__validate = function (field, value) {
  switch (field) {
    case 'securityToken':
      this.__validateSecurityToken(value);
      break;
    case 'domain':
      this.__validateDomain(value);
      break;
    default :
      throw new Error(__('No validation defined for field: ' + field));
  }
};

/**
 * Validate a security token.
 * @param token {string} The token to validate
 * @returns {boolean}
 * @throw Error on validation failure
 * @private
 */
UserSettings.prototype.__validateSecurityToken = function (token) {
  if ((typeof token === 'undefined')) {
    throw Error(__('A token cannot be empty'));
  }

  if (typeof token.code === 'undefined' || token.code === '') {
    throw Error(__('A token code cannot be empty'));
  }

  if (!Validator.isAlphanumericSpecial(token.code)) {
    throw new Error(__('The token code should only contain alphabetical and numeric characters'))
  }

  if (!Validator.isLength(token.code, 3, 3)) {
    throw Error(__('The token code should only contain 3 characters'))
  }

  if (typeof token.color === 'undefined' || token.color === '') {
    throw Error(__('The token color cannot be empty'));
  }

  if (!Validator.isHexColor(token.color)) {
    throw Error(__('This is not a valid token color: ' + token.color + '.'));
  }

  if (typeof token.textcolor === 'undefined' || token.textcolor === '') {
    throw Error(__('The token text color cannot be empty'));
  }

  if (!Validator.isHexColor(token.textcolor)) {
    throw Error(__('This is not a valid token text color: ' + token.textcolor + '.'));
  }
  return true;
};

/**
 * Validate a domain.
 * @param domain {string} The domain to validate
 * @returns {boolean}
 * @throw Error on validation failure
 * @private
 */
UserSettings.prototype.__validateDomain = function (domain) {
  if ((typeof domain === 'undefined' || domain === '')) {
    throw new Error(__('A domain cannot be empty'));
  }
  if (!Validator.isURL(domain)) {
    throw new Error(__('The trusted domain url is not valid'));
  }
  return true;
};

/**
 * Validate a settings object.
 *
 * @param settings {array} The settings to validate
 * @param fields {array} The names of the fields to validate
 * @returns {bool}
 * @throw Error if the secret is not valid
 */
UserSettings.prototype.validate = function (settings, fields) {
  if (typeof fields === 'undefined') {
    fields = ['securityToken', 'domain'];
  }

  var errors = [];
  for (var i in fields) {
    var fieldName = fields[i];
    try {
      this.__validate(fieldName, settings[fieldName]);
    } catch (e) {
      var fieldError = {};
      fieldError[fieldName] = e.message;
      errors.push(fieldError);
    }
  }

  if (errors.length > 0) {
    // Return exception with details in validationErrors.
    var e = new Error(__('settings could not be validated'));
    // Add validation errors to the error object.
    e.validationErrors = errors;
    throw e;
  }

  return settings;
};

/**
 * Get the user security token.
 * @returns {string}
 * @throw Error if security token is not set
 */
UserSettings.prototype.getSecurityToken = function () {
  var token = {};
  token.code = Config.read('user.settings.securityToken.code');
  token.color = Config.read('user.settings.securityToken.color');
  token.textcolor = Config.read('user.settings.securityToken.textColor');

  if ((typeof token.code === 'undefined') ||
    (typeof token.color === 'undefined') ||
    (typeof token.textcolor === 'undefined')) {
    throw new Error(__('Security token is not set'));
  }
  return token;
};

/**
 * Set the user security token.
 * @param token {string} The security token
 * @return {bool}
 * @throw Error if security token is not valid
 */
UserSettings.prototype.setSecurityToken = function (token) {
  this.__validateSecurityToken(token);
  Config.write('user.settings.securityToken.code', token.code);
  Config.write('user.settings.securityToken.color', token.color);
  Config.write('user.settings.securityToken.textColor', token.textcolor);
  return true;
};

/**
 * Set a domain that the plugin can trust.
 * @param domain {string} The domain
 * @throw Error if domain is not a valid
 */
UserSettings.prototype.setDomain = function (domain) {
  this.__validateDomain(domain);
  return Config.write('user.settings.trustedDomain', domain);
};

/**
 * Get the trusted domain.
 * @returns {string}
 * @throw Error if the trusted domain is not set
 */
UserSettings.prototype.getDomain = function () {
  var domain = Config.read('user.settings.trustedDomain');

  if (typeof domain === 'undefined') {
    if (!Config.isDebug()) {
      throw new Error(__('Trusted domain is not set'));
    } else {
      domain = Config.read('baseUrl');
      if (typeof domain === 'undefined') {
        throw new Error(__('Base url not found in config'));
      }
    }
  }
  return domain;
};

/**
 * Get the settings.
 * @param fields {array} (optional) An array of settings fields, if not provided
 *  return all the settings
 * @returns {object}
 */
UserSettings.prototype.get = function (fields) {
  var settings = {};

  var settingsDefaultFields = [
    'domain',
    'securityToken'
  ];

  if (typeof fields === 'undefined') {
    fields = settingsDefaultFields;
  }

  if (fields.indexOf('domain') !== -1) {
    settings.domain = this.getDomain();
  }
  if (fields.indexOf('securityToken') !== -1) {
    settings.securityToken = this.getSecurityToken();
  }

  return settings;
};

/**
 * Set all the settings at once.
 * @param settings {array} The settings to set
 * @returns {boolean}
 * @throw Error if settings is empty or doesn't validate
 */
UserSettings.prototype.set = function (settings) {
  if (typeof settings === 'undefined') {
    throw new Error(__('UserSettings cannot be empty'));
  }
  this.setSecurityToken(settings.securityToken);
  this.setDomain(settings.domain);
  return true;
};

/**
 * Flush the user settings
 */
UserSettings.prototype.flush = function () {
  Config.flush();
};

exports.UserSettings = UserSettings;