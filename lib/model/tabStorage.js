/**
 * Tab storage model.
 * It allows developers to easily get/set variables relative to a tab.
 * @todo The data relative to a tab should be destroyed at the same moment the tab is closed.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var _store = {};
exports._store = _store;

var TabStorage = function () {};

TabStorage.get = function (tabId, key) {
  if (_store[tabId] && _store[tabId][key]) {
    return _store[tabId][key];
  }
  return undefined;
};

TabStorage.set = function (tabId, key, value) {
  if (!_store[tabId]) {
    _store[tabId] = {};
  }
  _store[tabId][key] = value;
};

exports.TabStorage = TabStorage;
