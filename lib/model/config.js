var storage = new (require('../vendors/node-localstorage').LocalStorage)();
var _config = require("../config/config.json");

/**
 * Init the configuration.
 * @param worker
 */
var init = function(worker) {
  // Retrieve the config from the local storage
  var storedConfig = storage.getItem('config');
  // Retrieve the config defined by the admin in the config.json.
  for (var name in storedConfig) {
    write(name, storedConfig[name], false);
  }
};
exports.init = init;

/**
 * Read a configuration variable.
 * @param name
 * @returns {*}
 */
var read = function(name) {
  return _config[name];
};
exports.read = read;

/**
 * Read all configuration variables.
 * @returns {*}
 */
var readAll = function() {
  return _config;
};
exports.readAll = readAll;

/**
 * Read a configuration variable.
 * @param name
 * @returns {*}
 */
var write = function(name, value, store) {
  store = store == undefined || store ? true : false;
  _config[name] = value;
  if (store) {
    storage.setItem('config', _config);
  }
  return true;
};
exports.write = write;

/**
 * Is debug enabled?
 * @returns bool
 */
var isDebug = function () {
  var debug = read('debug');
  if( typeof debug === undefined) {
    return false;
  } else {
    return debug;
  }
};
exports.isDebug = isDebug;

var flush = function () {
  storage.deleteItem('config');
};
exports.flush = flush;

// Init the config.
init();
