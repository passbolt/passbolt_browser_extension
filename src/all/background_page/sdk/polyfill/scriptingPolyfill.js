/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.8.0
 */
import browser from "webextension-polyfill";

/**
 * This class provides a manifest_version 3 chrome.scripting API style polyfill to be used with mv2.
 * If the scripting API is already existing this polyfill is ignored.
 * This code must be imported for its side effect only
 */
class Scripting {
  /**
   * Insert the given script or function.
   * @param {ScriptInjection} options
   * @return {Promise<*|void>}
   */
  async executeScript(options) {
    return options.func
      ? await this._insertJsFunc(options)
      : this._insertJsFiles(options);
  }

  /**
   * Insert the given CSS file
   * @param {CSSInjection} options
   */
  insertCSS(options) {
    let callback = null;
    const fileArray = options.files;

    for (let i = fileArray.length - 1; i >= 0; --i) {
      const info = {file: fileArray[i], runAt: 'document_end', frameId: options.target?.frameIds[0]};
      callback = this._createCssCallback(options.target.tabId, info, callback);
    }

    if (callback) {
      callback();
    }
  }

  /**
   * Creates a callback that actually execute the given script.
   * @param {number} tabId
   * @param {InjectDetails} info
   * @param {function} callback
   * @returns {function}
   * @private
   */
  _createJsCallback(tabId, info, callback) {
    return () => chrome.tabs.executeScript(tabId, info, callback);
  }

  /**
   * Creates a callback that actually insert the given CSS.
   * @param {number} tabId
   * @param {InjectDetails} info
   * @param {function} callback
   * @returns {function}
   * @private
   */
  _createCssCallback(tabId, info, callback) {
    return () => chrome.tabs.insertCSS(tabId, info, callback);
  }

  /**
   * Insert all JS files in the given tab.
   * @param {ScriptInjection} options
   * @private
   */
  _insertJsFiles(options) {
    let callback = null;
    const fileArray = options.files;

    for (let i = fileArray.length - 1; i >= 0; --i) {
      const info = {file: fileArray[i], runAt: 'document_end', frameId: options.target?.frameIds[0]};
      callback = this._createJsCallback(options.target.tabId, info, callback);
    }

    if (callback) {
      callback();
    }
  }

  /**
   * Insert a JS function in the given tab.
   * The function is serialized and then inserted as a string in the document (to respect mv3 spirit).
   * @param {ScriptInjection} options
   * @private
   */
  async _insertJsFunc(options) {
    const funcArgs = JSON.stringify(options.args);
    const functionCall = `;${options.func.name}.apply(window, ${funcArgs});`;

    const codeToInject = options.func.toString() + functionCall;

    const info = {code: codeToInject, runAt: 'document_end', frameId: options.target?.frameIds[0]};
    const response = await browser.tabs.executeScript(options.target.tabId, info);
    // construct response like MV3
    return response?.map(data => ({result: data}));
  }
}

// If the API is not available, we insert this polyfill otherwise we keep the native API.
if (!browser.scripting) {
  browser.scripting = new Scripting();
}
