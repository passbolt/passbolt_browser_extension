/**
 * Local Storage Wrapper Class
 * Ref. PASSBOLT-1725
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
class LocalStorage {
  constructor() {
    this._storage = chrome.storage.local;
    this._data = {};
  }

  async init() {
    const _this = this;
    /*
     * Load the passbolt local storage.
     * Data are serialized in the local storage.
     */
    const items = await _this._storage.get('_passbolt_data');
    if (chrome.runtime.lastError) {
      throw new Error(chrome.runtime.lastError);
    }

    if (typeof items._passbolt_data !== 'undefined') {
      _this._data = JSON.parse(JSON.stringify(items._passbolt_data));
    }
  }


  /**
   * Save cached _data into chrome.storage
   * @private
   */
  async _store() {
    await this._storage.set({'_passbolt_data': this._data});
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
    }
  }

  /**
   * Return the current value associated with the given key
   * If the given key does not exist, return null.
   *
   * @param key string
   * @returns {*} or null
   */
  getItem(key) {
    const item = this._data[key];
    if (typeof item === 'undefined') {
      return null;
    }
    return item;
  }

  /**
   * Set an item for given key
   * @param key
   * @param value
   */
  setItem(key, value) {
    this._data[key] = value;
    this._store();
  }


  /**
   * Remove an item
   * @param keyStr
   */
  removeItem(key, subkey) {
    if (typeof subkey === 'undefined') {
      delete this._data[key];
    } else {
      delete this._data[key][subkey];
    }
    this._store();
  }
}

export default new LocalStorage();
