/**
 * ScriptExecution Helper
 * Make it easier to chrome.tabs.executeScript multiple scripts.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import browser from "./polyfill/browserPolyfill";

/**
 * Used to set the portname.
 * This function is used as a replacement for the imported JS code string.
 * With MV3 API, it's not possible anymore, we need an existing function to import.
 * @param {string} portname
 */
function globalSetPortname(portname) {
  window.portname = portname;
}

/**
 * Utility class to insert JS, CSS into a tab.
 */
class ScriptExecution {
  constructor(tabId) {
    this.tabId = tabId;
  }

  /**
   * Insert javascript files in the page
   * @param {Array<string>} fileArray
   */
  injectJs(fileArray) {
    if (fileArray.length === 0) {
      return;
    }

    browser.scripting.executeScript({
      files: fileArray,
      target: {
        tabId: this.tabId
      },
      world: "ISOLATED"
    });
  }

  /**
   * Inject an array of css files in a page
   * @param {Array<string>} fileArray
   */
  injectCss(fileArray) {
    if (fileArray.length === 0) {
      return;
    }

    browser.scripting.insertCSS({
      files: fileArray,
      target: {
        tabId: this.tabId
      }
    });
  }

  /**
   * Injects the portname as a global variable.
   * @param {string} portName
   */
  injectPortname(portName) {
    browser.scripting.executeScript({
      func: globalSetPortname,
      args: [portName],
      target: {
        tabId: this.tabId
      },
      world: "ISOLATED"
    });
  }
}

export default ScriptExecution;
