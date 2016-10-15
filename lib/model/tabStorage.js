/**
 * Tab storage model.
 *
 * The aim of the tab storage model is to offer a temporary storage layer to
 * make different parts of the application able to share data.
 *
 * By instance allowing different workers to share data together.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var _store = {};
exports._store = _store;

/**
 * The TabStorage constructor.
 * @constructor
 */
var TabStorage = function () {};

/**
 * Init the storage for a given tab.
 * @param tab
 */
TabStorage.initStorage = function (tab) {
  // Clean the tab storage on close.
  var onTabCloseHandler = function(tab) {
    TabStorage.destroyStorage(tab.id);
  };
  tab.on('close', onTabCloseHandler);
};

/**
 * Clean the stored values for a tabId.
 *
 * @param tabId The tab identifier
 */
TabStorage.destroyStorage = function (tabId) {
  if (_store[tabId]) {
    delete _store[tabId];
  }
};

/**
 * Get a value stored in the tab storage.
 *
 * @param tabId The tab identifier
 * @param key
 * @returns {*}
 */
TabStorage.get = function (tabId, key) {
  if (_store[tabId] && _store[tabId][key]) {
    return _store[tabId][key];
  }
  return undefined;
};

/**
 * Store a value in the tab storage.
 *
 * @param tabId The tab identifier
 * @param key
 * @param value
 */
TabStorage.set = function (tabId, key, value) {
  if (!_store[tabId]) {
    _store[tabId] = {};
  }
  _store[tabId][key] = value;
};

/**
 * Delete a value from the tab storage.
 *
 * @param tabId The tab identifier
 * @param key
 */
TabStorage.remove = function (tabId, key) {
  if (_store[tabId][key]) {
    delete _store[tabId][key];
  }
};

exports.TabStorage = TabStorage;
