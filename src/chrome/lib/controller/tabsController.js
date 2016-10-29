/**
 * Tab controller.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

/**
 * Open an url in a new tab.
 * @param url {string} The url to open
 */
var open = function (url) {
  chrome.tabs.create({url: url});
};
exports.open = open;

/**
 * Get the active tab url.
 * @return {string}
 */
var getActiveTabUrl = function () {
  //return tabs.activeTab.url;
};
exports.getActiveTabUrl = getActiveTabUrl;

/**
 * Set the active tab url.
 * @param url {string} The url to go to
 */
var setActiveTabUrl = function (url) {
  //tabs.activeTab.url = url;
};
exports.setActiveTabUrl = setActiveTabUrl;
