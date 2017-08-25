/**
 * ScriptExecution Helper
 * Make it easier to chrome.tabs.executeScript multiple scripts.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
/**
 * ScriptExecution Constructor
 *
 * @param tabId int
 * @constructor
 */
function ScriptExecution(tabId) {
  this.tabId = tabId;
}

/**
 * Create a callback to injects JavaScript code into a page.
 * ref. https://developer.chrome.com/extensions/tabs#method-executeScript
 *
 * @param tabId
 * @param details
 * @param callback
 * @returns {Function}
 */
ScriptExecution.prototype.createScriptCallback = function(tabId, details, callback) {
  return function () {
      chrome.tabs.executeScript(tabId, details, callback);
  };
};

/**
 * Create a callback to injects CSS into a page
 * ref. https://developer.chrome.com/extensions/tabs#method-insertCSS
 *
 * @param tabId
 * @param details
 * @param callback
 * @returns {Function}
 */
ScriptExecution.prototype.createCssCallback = function(tabId, details, callback) {
  return function () {
    chrome.tabs.insertCSS(tabId, details, callback);
  };
};

/**
 * Insert sequentially javascript code in the page
 *
 * @param fileArray array
 * @returns ScriptExecution object
 */
ScriptExecution.prototype.injectScripts = function (fileArray) {
  var callback = null;
  var info = null;

  for (var i = fileArray.length - 1; i >= 0; --i) {
    info = { file: fileArray[i], runAt: 'document_end' };
    callback = this.createScriptCallback(this.tabId, info, callback);
  }
  if (callback !== null) {
    callback();
  }
};

/**
 * Insert javascript code in the page
 *
 * @param codeArray array
 * @returns ScriptExecution object
 */
ScriptExecution.prototype.executeScript = function (codeArray) {
  var callback = null;
  var info = null;

  for (var i = codeArray.length - 1; i >= 0; --i) {
    info = { code: codeArray[i], runAt: 'document_end' };
    callback = this.createScriptCallback(this.tabId, info, callback);
  }
  if (callback !== null) {
    callback();
  }
};

/**
 * Inject sequentially an array of css file in a page
 *
 * @param fileArray array
 * @returns ScriptExecution object
 */
ScriptExecution.prototype.injectCss = function (fileArray) {
  var callback = null;
  var info = null;

  for (var i = fileArray.length - 1; i >= 0; --i) {
    info = { file: fileArray[i], runAt: 'document_end' };
    callback = this.createCssCallback(this.tabId, info, callback);
  }
  if (callback !== null) {
    callback();
  }
};

/**
 * Set a global variables in the content code environment
 * @param options as key value
 */
ScriptExecution.prototype.setGlobals = function (options) {
  var value, code;
  for (var key in options) {
    value = options[key];
    code = 'var ' + key + '="';
    if (typeof value === 'string') {
      code += options[key];
    } else {
      throw Error('ScriptExecution.setGlobal unsupported type');
    }
    code += '";';
  }
  this.executeScript([code]);
};

exports.ScriptExecution = ScriptExecution;