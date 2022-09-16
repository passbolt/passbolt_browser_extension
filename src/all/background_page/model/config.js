/**
 * Config model.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

import defaultConfig from '../config/config.json';
import _config from '../config/config.json';
import storage from "../sdk/storage";

/**
 * Init the configuration.
 * Retrieve and load the configuration stored in the local storage.
 */
const init = function() {
  // Retrieve the config from the local storage
  const storedConfig = storage.getItem('config');

  // No config in local storage, do nothing
  if (storedConfig === null) {
    return;
  }

  // Merge the config.json and config stored in local storage
  for (const name in storedConfig) {
    // only defined items not already defined in config.json
    if (typeof _config[name] === 'undefined') {
      _config[name] = storedConfig[name];
    }
  }
  migrate();
};

const migrate = function() {
  const storedConfig = storage.getItem('config');
  if (typeof storedConfig['debug'] !== 'undefined') {
    /*
     * v2.1.0 Migration - Delete unused config items
     * TODO - remove after next release
     */
    storage.removeItem('config', 'setupBootstrapRegex');
    storage.removeItem('config', 'debug');
    storage.removeItem('config', 'log');
    storage.removeItem('config', 'baseUrl');
    storage.removeItem('config', 'extensionId');
  }
};

/**
 * Read a configuration variable.
 *
 * @param name {string} Variable name to obtain
 * @returns {*}
 */
const read = function(name) {
  if (typeof _config[name] !== 'undefined') {
    return _config[name];
  }
  return undefined;
};

/**
 * Read all configuration variables.
 *
 * @returns {array}
 */
const readAll = function() {
  return _config;
};

/**
 * Set a configuration variable.
 *
 * @param name {string} Variable name to store
 * @param value {mixed} Variable value
 * @returns {boolean}
 */
const write = function(name, value) {
  // do not allow to override the debug mode
  if (name === 'debug') {
    return false;
  }
  _config[name] = value;
  storage.setItem('config', _config);
  return true;
};

/**
 * Is debug enabled?
 *
 * @returns {bool}
 */
const isDebug = function() {
  const debug = read('debug');
  if (typeof debug === 'undefined') {
    return false;
  } else {
    return debug;
  }
};

/**
 * Flush the local storage config.
 */
const flush = function() {
  // Remove all properties from the local _config variable.
  for (const key in _config) {
    delete _config[key];
  }
  // Add the default config to the local _config variable.
  for (const key in defaultConfig) {
    _config[key] = defaultConfig[key];
  }
  storage.removeItem('config');
};

export const Config = {init, read, write, flush, isDebug, migrate, readAll};
