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
  const _this = this;
  /*
   * Load the passbolt local storage.
   * Data are serialized in the local storage.
   */
  return new Promise((resolve, reject) => {
    _this._storage.get('_passbolt_data', items => {
      if (typeof chrome.runtime.lastError !== 'undefined' && chrome.runtime.lastError !== null) {
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
LocalStorage.prototype._store = function() {
  this._storage.set({'_passbolt_data': this._data}, () => {
    if (typeof chrome.runtime.lastError !== 'undefined' && chrome.runtime.lastError !== null) {
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
LocalStorage.prototype.getItem = function(key) {
  const item = this._data[key];
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
LocalStorage.prototype.setItem = function(key, value) {
  this._data[key] = value;
  this._store();
};

/**
 * Remove an item
 * @param keyStr
 */
LocalStorage.prototype.removeItem = function(key, subkey) {
  if (typeof subkey === 'undefined') {
    delete this._data[key];
  } else {
    delete this._data[key][subkey];
  }
  this._store();
};

export default new LocalStorage();
