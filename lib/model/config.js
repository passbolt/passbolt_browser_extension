var storage = new (require('../node-localstorage').LocalStorage)();
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
};
exports.write = write;


// Init the config.
init();
