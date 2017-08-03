/**
 * Local Storage Wrapper Class
 * Ref. PASSBOLT-1725
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
function LocalStorage() {
  this._storage = chrome.storage.local;
  this._data = {};
}

LocalStorage.prototype.init = function() {
  var _this = this;
  // Load the passbolt local storage.
  // Data are serialized in the local storage.
  return new Promise (function(resolve, reject) {
    _this._storage.get('_passbolt_data', function(items) {
      if( typeof chrome.runtime.lastError !== 'undefined') {
        reject(chrome.runtime.lastError);
      } else {
        if (typeof items._passbolt_data !== 'undefined') {
          _this._data = JSON.parse(JSON.stringify(items._passbolt_data));
        }
      }
      resolve();
    });
  });
};

/**
 * Save cached _data into chrome.storage
 * @private
 */
LocalStorage.prototype._store = function () {
  this._storage.set({'_passbolt_data': this._data}, function() {
    if( typeof chrome.runtime.lastError !== 'undefined') {
      console.error(chrome.runtime.lastError.message);
    }
  });
};

/**
 * Return the current value associated with the given key
 * If the given key does not exist, return null.
 *
 * @param key string
 * @returns {*} or null
 */
LocalStorage.prototype.getItem = function (key) {
  var item = this._data[key];
  if (typeof item === 'undefined') {
    return null;
  }
  return item;
};

/**
 * Set an item for given key
 * @param key
 * @param value
 */
LocalStorage.prototype.setItem = function (key, value) {
  this._data[key] = value;
  this._store();
};

/**
 * Remove an item
 * @param keyStr
 */
LocalStorage.prototype.removeItem = function (key) {
  delete this._data[key];
  this._store();
};

// ---------------------------------------------------
//  MIGRATION HELPERS - TO BE DEPRECATED AFTER v1.6.2
// ---------------------------------------------------
/**
 * Migrate a data set to the chrome.storage
 * Delete an window.localStorage if any
 * @param data provided by SDK extension for example
 */
LocalStorage.prototype.migrate = function (data) {
  // if data is not undefined, it is a firefox sdk migration
  // where data are provided to the embedded webext
  // Otheriwse try a chrome migration from window.localStorage
  if (typeof data === 'undefined') {
    data = window.localStorage.getItem('_passbolt_data');
    // already migrated
    if (data === null) {
      return;
    }
    window.localStorage.removeItem('_passbolt_data');
  }
  this._data = JSON.parse(data);
  this._store();
};

/**
 * Check if a migration is needed
 * @return boolean
 */
LocalStorage.prototype.migrationNeeded = function () {
  var data = window.localStorage.getItem('_passbolt_data');
  return (data !== null);
};

exports.LocalStorage = LocalStorage;
var storage = new LocalStorage();
exports.storage = storage;
