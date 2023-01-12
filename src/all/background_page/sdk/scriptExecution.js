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
 * Used to create an object url.
 * With MV3 API, it's not possible anymore to use the function createObjectURL.
 * @param {string} dataUrl base64 url (Blob is not serializable a base64 url is needed)
 * @return {string}
 */
function createObjectURL(dataUrl) {
  const contentType = dataUrl.split(',')[0].split(':')[1].split(';')[0];
  const b64Data = dataUrl.split(',')[1];
  const sliceSize = 512;
  // Base64 to BLOB (For security issue, avoid using fetch)
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  const blob = new Blob(byteArrays, {type: contentType});
  return self.URL.createObjectURL(blob);
}

/**
 * Used to revoke an object url.
 * With MV3 API, it's not possible anymore to use the function revokeObjectURL.
 * @param {string} url The url to revoke
 */
function revokeObjectURL(url) {
  self.URL.revokeObjectURL(url);
}

/**
 * Utility class to insert JS, CSS into a tab.
 */
class ScriptExecution {
  constructor(tabId, frameId = 0) {
    this.tabId = tabId;
    this.frameId = frameId;
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
        tabId: this.tabId,
        frameIds: [this.frameId]
      },
      // Very important to isolated script and avoiding to share global variable between scripts
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
        tabId: this.tabId,
        frameIds: [this.frameId]
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
        tabId: this.tabId,
        frameIds: [this.frameId]
      },
      world: "ISOLATED"
    });
  }

  /**
   * Injects the base64 object url and create object url with a Blob.
   * @param {string} dataUrl The base64 url
   * @returns {Promise<*>}
   */
  async injectBase64UrlToCreateObjectURL(dataUrl) {
    const response = await browser.scripting.executeScript({
      func: createObjectURL,
      args: [dataUrl],
      target: {
        tabId: this.tabId,
        frameIds: [this.frameId]
      },
      world: "ISOLATED"
    });
    return response[0]?.result;
  }

  /**
   * Injects the url to revoke.
   * @param {string} url The url to revoke
   */
  injectURLToRevoke(url) {
    browser.scripting.executeScript({
      func: revokeObjectURL,
      args: [url],
      target: {
        tabId: this.tabId,
        frameIds: [this.frameId]
      },
      world: "ISOLATED"
    });
  }
}

export default ScriptExecution;
