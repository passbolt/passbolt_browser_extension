/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.0.0
 */
import {Config} from "../config";
import Validator from "validator";

/**
 * The class that deals with users settings
 */
class UserSettings {
  /**
   * Sanity check on user settings.
   *
   * @return {boolean}
   */
  isValid() {
    try {
      this.getSecurityToken();
      this.getDomain();
    } catch (e) {
      return false;
    }
    return true;
  }

  /**
   * Validate settings fields individually.
   *
   * @param {string} field The field name
   * @param {*} value The field value
   * @throw Error if the field is not valid
   * @returns {void}
   */
  validateField(field, value) {
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
      case 'locale':
        this.validateLocale(value);
        break;
      default :
        throw new Error(`No validation defined for field: ${field}.`);
    }
  }

  /**
   * Validate a security token.
   *
   * @param token {{code: string, color: string, textColor: string}} The token to validate
   * @returns {boolean}
   * @throw Error on validation failure
   * @private
   */
  validateSecurityToken(token) {
    if ((typeof token === 'undefined')) {
      throw Error('A token cannot be empty.');
    }

    if (typeof token.code === 'undefined' || token.code === '') {
      throw Error('A token code cannot be empty.');
    }

    if (!Validator.isAscii(token.code)) {
      throw new Error('The token code should only contain ASCII characters.');
    }

    if (!Validator.isLength(token.code, 3, 3)) {
      throw Error('The token code should only contain 3 characters.');
    }

    if (typeof token.color === 'undefined' || token.color === '') {
      throw Error('The token color cannot be empty.');
    }

    if (!Validator.isHexColor(token.color)) {
      throw Error(`This is not a valid token color: ${token.color}.`);
    }

    if (typeof token.textcolor === 'undefined' || token.textcolor === '') {
      throw Error('The token text color cannot be empty.');
    }

    if (!Validator.isHexColor(token.textcolor)) {
      throw Error(`This is not a valid token text color: ${token.textcolor}.`);
    }
    return true;
  }

  /**
   * Validate a domain.
   *
   * @param domain {string} The domain to validate
   * @throw Error on validation failure
   * @returns {void}
   */
  validateDomain(domain) {
    if ((typeof domain === 'undefined' || domain === '')) {
      throw new Error('A domain cannot be empty');
    }
    if (!Validator.isURL(domain, {require_tld: false})) {
      throw new Error('The trusted domain url is not valid.');
    }
  }

  /**
   * Validate a theme.
   *
   * @param theme {string} The theme to validate
   * @throw {Error} on validation failure
   * @returns {void}
   */
  validateTheme(theme) {
    const whitelist = ['default', 'midgar', 'solarized_light', 'solarized_dark'];
    if (whitelist.indexOf(theme) === -1) {
      throw new Error('The theme is not valid.');
    }
  }

  /**
   * Validate locale language.
   *
   * @param locale {string} The locale to validate
   * @throw {Error} on validation failure
   * @returns {void}
   */
  validateLocale(locale) {
    const regex = new RegExp("^[a-z]{2}-[A-Z]{2}$");
    if (!locale.match(regex)) {
      throw new Error('The locale is not valid.');
    }
  }

  /**
   * Validate a settings object.
   *
   * @param settings {array} The settings to validate
   * @param fields {array} The names of the fields to validate
   * @returns {bool}
   * @throw Error if the secret is not valid
   */
  validate(settings, fields) {
    if (typeof fields === 'undefined') {
      fields = ['securityToken', 'domain'];
    }

    const errors = [];
    for (const i in fields) {
      const fieldName = fields[i];
      try {
        this.validateField(fieldName, settings[fieldName]);
      } catch (e) {
        const fieldError = {};
        fieldError[fieldName] = e.message;
        errors.push(fieldError);
      }
    }

    if (errors.length > 0) {
      // Return exception with details in validationErrors.
      const e = new Error('settings could not be validated');
      // Add validation errors to the error object.
      e.validationErrors = errors;
      throw e;
    }

    return settings;
  }

  /**
   * Get the user security token.
   *
   * @returns {string}
   * @throw Error if security token is not set
   */
  getSecurityToken() {
    const token = {};
    token.code = Config.read('user.settings.securityToken.code');
    token.color = Config.read('user.settings.securityToken.color');
    token.textcolor = Config.read('user.settings.securityToken.textColor');

    if ((typeof token.code === 'undefined') ||
      (typeof token.color === 'undefined') ||
      (typeof token.textcolor === 'undefined')) {
      throw new Error('Security token is not set');
    }
    return token;
  }

  /**
   * Set the user security token.
   *
   * @param token {{code: string, color: string, textColor: string}} The security token
   * @return {bool}
   * @throw Error if security token is not valid
   */
  setSecurityToken(token) {
    this.validateSecurityToken(token);
    Config.write('user.settings.securityToken.code', token.code);
    Config.write('user.settings.securityToken.color', token.color);
    Config.write('user.settings.securityToken.textColor', token.textcolor);

    return true;
  }

  /**
   * Set a domain that the plugin can trust.
   *
   * @param domain {string} The domain
   * @throw Error if domain is not a valid
   */
  setDomain(domain) {
    this.validateDomain(domain);
    return Config.write('user.settings.trustedDomain', domain);
  }

  /**
   * Get the trusted domain.
   *
   * @returns {string}
   * @throw {Error} if the trusted domain is not set
   */
  getDomain() {
    const domain = Config.read('user.settings.trustedDomain');
    if (typeof domain === 'undefined') {
      throw new Error('Trusted domain is not set');
    }
    return domain;
  }

  /**
   * Set a theme for the user
   *
   * @param theme {string} The theme name
   * @throw Error if theme is not a valid
   */
  setTheme(theme) {
    this.validateTheme(theme);
    return Config.write('user.settings.theme', theme);
  }

  /**
   * Get the currently selected theme for the user
   *
   * @returns {string}
   * @throw Error if the theme is not set
   */
  getTheme() {
    const theme = Config.read('user.settings.theme');
    if (typeof theme === 'undefined') {
      throw new Error('The user has no selected themes.');
    }
    return theme;
  }

  /**
   * Set a locale for the user
   *
   * @param locale {string} The locale language
   * @return {Promise<void>}
   * @throw Error if locale is not a valid
   */
  async setLocale(locale) {
    this.validateLocale(locale);
    return Config.write('user.settings.locale', locale);
  }

  /**
   * Get the currently selected locale for the user
   *
   * @returns {string}
   * @throw Error if the locale is not set
   */
  getLocale() {
    const locale = Config.read('user.settings.locale');
    if (typeof locale === 'undefined') {
      throw new Error('The user has no locale language.');
    }
    return locale;
  }

  /**
   * Get the settings.
   *
   * @param{array} [fields] (optional) An array of settings fields, if not provided return all the settings
   * @returns {object}
   */
  get(fields) {
    const settings = {};
    const settingsDefaultFields = [
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
  }

  /**
   * Set all the settings at once.
   * @param {array} settings The settings to set
   * @returns {boolean}
   * @throw Error if settings is empty or doesn't validate
   */
  set(settings) {
    if (typeof settings === 'undefined') {
      throw new Error('UserSettings cannot be empty');
    }
    this.setSecurityToken(settings.securityToken);
    this.setDomain(settings.domain);

    return true;
  }

  /**
   * Set default settings for the user
   *
   * @return void
   */
  setDefaults() {
    this.setTheme('default');
  }

  /**
   * Flush the user settings
   * @TODO move to an local storage service
   */
  flush() {
    Config.flush();
  }

  /**
   * Get the remote account settings and add them
   *
   * @returns {Promise<Boolean>}
   * @TODO move to an API service
   */
  async sync() {
    // Get remote account settings (all)
    const url = `${this.getDomain()}/account/settings.json` + `?api-version=v2`;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    const json = await response.json();

    // Check response status
    if (!response.ok) {
      let msg = 'Could not synchronize the account settings. The server responded with an error.';
      if (json.header.msg) {
        msg += ` ${json.header.msg}`;
      }
      msg += `(${response.status})`;
      throw new Error(msg);
    }
    if (!json.header) {
      throw new Error('Could not synchronize account settings. The server response header is missing.');
    }
    if (!json.body) {
      throw new Error('Could not synchronize account settings. The server response body is missing.');
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
          case 'locale':
            this.setLocale(props.value);
            break;
          default:
            console.error(`Unknown property ${props.property}`);
            break;
        }
      }
    }

    return true;
  }
}
export default UserSettings;
