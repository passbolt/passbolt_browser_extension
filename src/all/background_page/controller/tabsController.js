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
const open = function(url) {
  chrome.tabs.create({url: url});
};

/**
 * Get the active tab url.
 * @return {string}
 */
const getActiveTabUrl = function() {
  return new Promise(resolve => {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      resolve(tabs[0].url);
    });
  });
};

/**
 * Set the active tab url.
 * @param url {string} The url to go to
 */
const setActiveTabUrl = function(url) {
  if (url) {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      const tab = tabs[0];

      /*
       * In case the url given was generated using self.data.url
       * remove the chrome-extension://<plugin id>/ part of the url
       * since it's added again by chrome.tabs.update
       */
      const replaceStr = `chrome-extension://${chrome.runtime.id}/`;
      url = url.replace(replaceStr, '');

      chrome.tabs.update(tab.id, {url: url});
    });
  }
};

export const TabController = {open, getActiveTabUrl, setActiveTabUrl};
