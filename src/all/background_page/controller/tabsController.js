/**
 * Tab controller.
 *
 * @copyright (c) 2017 Passbolt SARL
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
  return new Promise(function(resolve, reject) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      resolve(tabs[0].url);
    });
  });
};
exports.getActiveTabUrl = getActiveTabUrl;

/**
 * Set the active tab url.
 * @param url {string} The url to go to
 */
var setActiveTabUrl = function (url) {
  if (url) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var tab = tabs[0];

      // In case the url given was generated using self.data.url
      // remove the chrome-extension://<plugin id>/ part of the url
      // since it's added again by chrome.tabs.update
      var replaceStr = 'chrome-extension://' + chrome.runtime.id + '/';
      url = url.replace(replaceStr, '');

      chrome.tabs.update(tab.id, {url: url});
    });
  }
};
exports.setActiveTabUrl = setActiveTabUrl;
