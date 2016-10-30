/**
 * ScriptExecution Helper
 * Make it easier to chrome.tabs.executeScript multiple scripts.
 *
 * @licence ISC https://opensource.org/licenses/ISC
 * @credit https://github.com/ReeganExE/chrome-script-execution
 */
/**
 * ScriptExecution Constructor
 *
 * @param tabId int
 * @constructor
 */
function ScriptExecution(tabId) {
  this.tabId = tabId;
  this.basePath = 'data/'
}

/**
 * Array of js file names with path
 *
 * @param fileArray array
 * @returns ScriptExecution object
 */
ScriptExecution.prototype.injectScripts = function (fileArray) {
  var _this = this;
  return Promise.all(fileArray.map(function (file) {
    return exeScript(_this.tabId, _this.basePath + file);
  })).then(function () {
    return _this;
  });
};

/**
 * Array of css file names with path
 *
 * @param fileArray array
 * @returns ScriptExecution object
 */
ScriptExecution.prototype.injectCss = function (fileArray) {
  var _this = this;
  return Promise.all(fileArray.map(function (file) {
    return exeCss(_this.tabId, _this.basePath + file);
  })).then(function () {
    return _this;
  });
};

/**
 * Insert javascript code in the page
 *
 * @param fileArray array
 * @returns ScriptExecution object
 */
ScriptExecution.prototype.executeScript = function (fileArray) {
  var _this = this;

  fileArray = Array.prototype.slice.call(arguments);
  return Promise.all(fileArray.map(function (code) {
    return exeCodes(_this.tabId, code);
  })).then(function () {
    return _this;
  });
};

/**
 * Set a global variables in the content code environment
 * @param name
 * @param value
 */
ScriptExecution.prototype.setGlobals = function (options) {
  var value, code;
  for (var key in options) {
    value = options[key];
    code = 'var ' + key + '="';
    if (typeof value === 'string') {
      code += options[key];
    } else {
      throw Error('ScriptExecution.setGlobal unsuported type');
    }
    code += '";';
  }
  this.executeScript(code);
};

/**
 * Call an async function of chrome.tabs and makes it a promise
 *
 * @param fn function to execute
 * @param tabId int
 * @param info info object
 * @returns Promise
 */
function promiseTo(fn, tabId, info) {
  return new Promise(function (resolve) {
    fn.call(chrome.tabs, tabId, info, function () {
      return resolve();
    });
  });
}

/**
 * Insert a script file in the page
 *
 * @param tabId
 * @param path
 * @returns Promise
 */
function exeScript(tabId, path) {
  var info = { file: path, runAt: 'document_end' };
  return promiseTo(chrome.tabs.executeScript, tabId, info);
}

/**
 * Insert a stylesheet
 *
 * @param tabId
 * @param path
 * @returns {Promise}
 */
function exeCss(tabId, path) {
  var info = { file: path, runAt: 'document_end' };
  return promiseTo(chrome.tabs.insertCSS, tabId, info);
}

/**
 * Insert a script code snippet in the page
 *
 * @param tabId
 * @param code
 * @returns {Promise}
 */
function exeCodes(tabId, code) {
  var info = { code: code, runAt: 'document_end' };
  return promiseTo(chrome.tabs.executeScript, tabId, info);
}

exports.ScriptExecution = ScriptExecution;
