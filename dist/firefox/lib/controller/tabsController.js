/**
 * Tab controller.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var tabs = require('sdk/tabs');
const defer = require('sdk/core/promise').defer;

/**
 * Open an url in a new tab.
 * @param url {string} The url to open
 */
var open = function (url) {
  tabs.open(url);
};
exports.open = open;

/**
 * Get the active tab url.
 * @return {promise}
 */
var getActiveTabUrl = function() {
  var deferred = defer();
  deferred.resolve(tabs.activeTab.url);
  return deferred.promise;
};
exports.getActiveTabUrl = getActiveTabUrl;

/**
 * Set the active tab url.
 * @param url {string} The url to go to
 */
var setActiveTabUrl = function(url) {
  tabs.activeTab.url = url;
};
exports.setActiveTabUrl = setActiveTabUrl;
