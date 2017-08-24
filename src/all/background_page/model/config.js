/**
 * Config model.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var _config = require('../config/config.json');

/**
 * Init the configuration.
 * Retrieve and load the configuration stored in the local storage.
 */
var init = function () {
  // Retrieve the config from the local storage
  var storedConfig = storage.getItem('config');

  // No config in local storage, do nothing
  if (storedConfig === null ) {
    return;
  }

  // Retrieve the config defined by the admin in the config.json.
  for (var name in storedConfig) {
    write(name, storedConfig[name], false);
  }
};
exports.init = init;

/**
 * Read a configuration variable.
 *
 * @param name {string} Variable name to obtain
 * @returns {*}
 */
var read = function (name) {
  return _config[name];
};
exports.read = read;

/**
 * Read all configuration variables.
 *
 * @returns {array}
 */
var readAll = function () {
  return _config;
};
exports.readAll = readAll;

/**
 * Set a configuration variable.
 *
 * @param name {string} Variable name to store
 * @param value {mixed} Variable value
 * @param store {boolean} (optional) Should the configuration variables be
 *  stored in the local storage. By default true.
 * @returns {boolean}
 */
var write = function (name, value, store) {
  // do not allow to override the debug mode
  if (name === 'debug') {
    return false;
  }
  _config[name] = value;
  if (typeof store === 'undefined' || store) {
    storage.setItem('config', _config);
  }
  return true;
};
exports.write = write;

/**
 * Is debug enabled?
 *
 * @returns {bool}
 */
var isDebug = function () {
  var debug = read('debug');
  if (typeof debug === 'undefined') {
    return false;
  } else {
    return debug;
  }
};
exports.isDebug = isDebug;

/**
 * Flush the local storage config.
 */
var flush = function () {
  storage.removeItem('config');
};
exports.flush = flush;

// Init the config.
init();
