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
 *
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
 *
 * @param field {string} The field name
 * @param value {*} The field value
 * @returns {boolean}
 * @private
 * @throw Error if the field is not valid
 */
UserSettings.prototype.validateField = function (field, value) {
  switch (field) {
    case 'securityToken':
      this.validateSecurityToken(value);
      break;
    case 'domain':
      this.validateDomain(value);
      break;
    case 'theme':
      this.validateTheme(value);
      break;
    default :
      throw new Error(__(`No validation defined for field: ${field}.`));
  }
};

/**
 * Validate a security token.
 *
 * @param token {string} The token to validate
 * @returns {boolean}
 * @throw Error on validation failure
 * @private
 */
UserSettings.prototype.validateSecurityToken = function (token) {
  if ((typeof token === 'undefined')) {
    throw Error(__('A token cannot be empty.'));
  }

  if (typeof token.code === 'undefined' || token.code === '') {
    throw Error(__('A token code cannot be empty.'));
  }

  if (!Validator.isAscii(token.code)) {
    throw new Error(__('The token code should only contain ASCII characters.'))
  }

  if (!Validator.isLength(token.code, 3, 3)) {
    throw Error(__('The token code should only contain 3 characters.'))
  }

  if (typeof token.color === 'undefined' || token.color === '') {
    throw Error(__('The token color cannot be empty.'));
  }

  if (!Validator.isHexColor(token.color)) {
    throw Error(__(`This is not a valid token color: ${token.color}.`));
  }

  if (typeof token.textcolor === 'undefined' || token.textcolor === '') {
    throw Error(__('The token text color cannot be empty.'));
  }

  if (!Validator.isHexColor(token.textcolor)) {
    throw Error(__(`This is not a valid token text color: ${token.textcolor}.`));
  }
  return true;
};

/**
 * Validate a domain.
 *
 * @param domain {string} The domain to validate
 * @returns {boolean}
 * @throw Error on validation failure
 * @private
 */
UserSettings.prototype.validateDomain = function (domain) {
  if ((typeof domain === 'undefined' || domain === '')) {
    throw new Error(__('A domain cannot be empty'));
  }
  if (!Validator.isURL(domain)) {
    throw new Error(__('The trusted domain url is not valid.'));
  }
  return true;
};

/**
 * Validate a theme.
 *
 * @param theme {string} The theme to validate
 * @returns {boolean}
 * @throw Error on validation failure
 */
UserSettings.prototype.validateTheme = function (theme) {
  const whitelist = ['default', 'midgar'];
  if (whitelist.indexOf(theme) === -1) {
    throw new Error(__('The theme is not valid.'));
  }
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
      this.validateField(fieldName, settings[fieldName]);
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
 *
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
 *
 * @param token {string} The security token
 * @return {bool}
 * @throw Error if security token is not valid
 */
UserSettings.prototype.setSecurityToken = function (token) {
  this.validateSecurityToken(token);
  Config.write('user.settings.securityToken.code', token.code);
  Config.write('user.settings.securityToken.color', token.color);
  Config.write('user.settings.securityToken.textColor', token.textcolor);
  return true;
};

/**
 * Set a domain that the plugin can trust.
 *
 * @param domain {string} The domain
 * @throw Error if domain is not a valid
 */
UserSettings.prototype.setDomain = function (domain) {
  this.validateDomain(domain);
  return Config.write('user.settings.trustedDomain', domain);
};

/**
 * Get the trusted domain.
 *
 * @returns {string}
 * @throw Error if the trusted domain is not set
 */
UserSettings.prototype.getDomain = function () {
  const domain = Config.read('user.settings.trustedDomain');
  if (typeof domain === 'undefined') {
    throw new Error(__('Trusted domain is not set'));
  }
  return domain;
};

/**
 * Set a theme for the user
 *
 * @param theme {string} The theme name
 * @throw Error if theme is not a valid
 */
UserSettings.prototype.setTheme = function (theme) {
  this.validateTheme(theme);
  return Config.write('user.settings.theme', theme);
};

/**
 * Get the currently selected theme for the user
 *
 * @returns {string}
 * @throw Error if the theme is not set
 */
UserSettings.prototype.getTheme = function () {
  const theme = Config.read('user.settings.theme');
  if (typeof theme === 'undefined') {
    throw new Error(__('The user has no selected themes.'));
  }
  return theme;
};

/**
 * Get the settings.
 *
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
 * Set default settings for the user
 *
 * @return void
 */
UserSettings.prototype.setDefaults = function () {
  this.setTheme('default');
};

/**
 * Flush the user settings
 */
UserSettings.prototype.flush = function () {
  Config.flush();
};


/**
 * Get the remote account settings and add them
 *
 * @returns {Promise<Boolean>}
 */
UserSettings.prototype.sync = async function () {
  // Get remote account settings (all)
  let url = this.getDomain() + '/account/settings.json' + '?api-version=v2';
  let response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
  let json = await response.json();

  // Check response status
  if (!response.ok) {
    let msg = __('Could not synchronize the account settings. The server responded with an error.');
    if (json.header.msg) {
      msg += ' ' + json.header.msg;
    }
    msg += '(' + response.status + ')';
    throw new Error(msg);
  }
  if (!json.header) {
    throw new Error(__('Could not synchronize account settings. The server response header is missing.'));
  }
  if (!json.body) {
    throw new Error(__('Could not synchronize account settings. The server response body is missing.'));
  }

  // Store all the new properties and associated values.
  let props, i;
  for (i in json.body) {
    props = json.body[i];
    if (typeof props.property !== 'undefined') {
      switch (props.property) {
        case 'theme':
            this.setTheme(props.value);
          break;
        default:
          console.error(`Unknown property ${props.property}`);
          break;
      }
    }
  }

  return true;
};

exports.UserSettings = UserSettings;
