/**
 * PageMod Chrome Wrapper
 * Allow using pagemods in chrome almost like firefox sdk
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var ScriptExecution = require('../sdk/scriptExecution').ScriptExecution;
var Worker = require('../sdk/worker').Worker;
var self = require('../sdk/self');
var Crypto = require('../model/crypto').Crypto;
var Workers = require('../model/worker');

/**
 * PageMod Chrome Wrapper
 *
 * @param args
 * @constructor
 */
var PageMod = function(args) {
  this.args = args;
  this._ports = []; // list of tab ids in which the pagemod has a port open
  this._listeners = []; // list of listeners initialized by this pagemod
  this.__init();
};

/**
 * Members
 * @type {{}}
 */
PageMod.prototype.args = {};

/**
 * Public functions
 * Part of Firefox SDK
 */
/**
 * PageMod Destroy
 */
PageMod.prototype.destroy = function () {
  // Stops the page-mod from making any more modifications.
  // Once destroyed the page-mod can no longer be used.
  // Modifications already made to open documents by content scripts will not be undone
  // Unsuported: stylesheets added by contentStyle or contentStyleFile, will be unregistered immediately.
  if(typeof this._listeners['chrome.tabs.onRemoved'] !== 'undefined') {
    chrome.tabs.onRemoved.removeListener(this._listeners['chrome.tabs.onRemoved']);
    chrome.tabs.onReplaced.removeListener(this._listeners['chrome.tabs.onReplaced']);
    chrome.tabs.onUpdated.removeListener(this._listeners['chrome.tabs.onUpdated']);
  }

  if(typeof this._listeners['chrome.runtime.onConnect'] !== 'undefined') {
    chrome.runtime.onConnect.removeListener(this._listeners['chrome.runtime.onConnect']);
  }
  // clear the tab and listeners
  this._ports = [];
  this._listeners = [];
  this._loading = [];

};

/**
 * Private function
 * Not part of Firefox SDK
 */
/**
 * PageMod Init
 */
PageMod.prototype.__init = function() {

  // The url to use for the pageMod include is not a regex
  if(!(this.args.include instanceof RegExp)) {
		if (this.args.include.startsWith('about:blank')) {
			// For URL patterns like 'about:blank?passbolt=passbolt-iframe*'
			// Contrarily to Firefox we do not inject scripts in the page
			// They are loaded via chrome-extension://[pluginid]/js/iframe.html templates
			// We wait for the page mod to initiate the connection
			this.__onIframeConnectInit();
			return;
		} else if (this.args.include.startsWith(chrome.runtime.getURL(''))) {
			// And similarly for any chrome-extension:// urls
			this.__onContentConnectInit();
			return;
		} else {
			this.args.include = new RegExp(this.args.include);
		}
  }

  // When a tab is updated we try to insert content code if it matches
  // the include and contentScriptWhen pageMod parameters
  var _this = this;
  this._listeners['chrome.tabs.onUpdated'] = function(tabId, changeInfo, tab) {
    _this.__onTabUpdated(tabId, changeInfo, tab);
  };
  chrome.tabs.onUpdated.addListener(this._listeners['chrome.tabs.onUpdated']);

  // Sometimes the page is loaded from the cache and the 'onUpdate' listener is
  // not fired. To make sure we cover that case we listen to 'onReplaced' events
  // fired when a tab is replaced with another tab due to prerendering or instant.
  // see. https://bugs.chromium.org/p/chromium/issues/detail?id=109557
  this._listeners['chrome.tabs.onReplaced'] = function (addedTabId, removedTabId) {
    chrome.tabs.get(addedTabId, function(tab){
      _this.__onTabUpdated(tab.id, {status:'complete'}, tab);
    });
  };
  chrome.tabs.onReplaced.addListener(this._listeners['chrome.tabs.onReplaced']);

  // Using attachto a pagemod can be launched to an already opened tab
  // Useful after an install or a reinstall
  // see. attachTo: ["existing", "top"]
  // Existing = attach to already opened tab (default not)
  // Top = attach to only top document and not iframes (we can't attach to iframe in chrome anyway)
  if(typeof this.args.attachTo !== 'undefined') {
    chrome.tabs.query({}, function(tabs){
      tabs.forEach(function(tab){
        _this.__onAttachExistingTab(tab);
      });
    });
  }

  // When a tab is closed cleanup
  this._listeners['chrome.tabs.onRemoved'] = function (tabId) {
    var index = _this._ports.indexOf(tabId);
    _this._ports.splice(index, 1);
  };
  chrome.tabs.onRemoved.addListener(this._listeners['chrome.tabs.onRemoved']);
};

/**
 * Manage runtime.onConnect listeners
 *
 * @private
 */
PageMod.prototype.__initConnectListener = function(portName, tabId, iframe) {
  var _this = this;
  if(typeof iframe === 'undefined') {
    iframe = false;
  }
  this._listeners['chrome.runtime.onConnect'] = function (port) {
    // check if the portname match
    if(port.name === portName) {

      // if there is a connection on the port for a pagemod that
      // was previously matching on that tab but not anymore
      if(!iframe && !_this.__checkUrl(port.sender.tab.url)) {
          // detach any existing worker
          if(Workers.exists(_this.args.name, port.sender.tab.id)) {
            Workers.get(_this.args.name, port.sender.tab.id).destroy('destroying worker because url changed');
          }
          return;
      }

      // add the sender tab id to the list of active tab for that worker
      if(typeof tabId === 'undefined' || tabId === port.sender.tab.id) {
        _this._ports.push(port.sender.tab.id);

        var worker = new Worker(port, iframe);
        _this.args.onAttach(worker);
      }
    }
  };
  chrome.runtime.onConnect.addListener(this._listeners['chrome.runtime.onConnect']);
};

/**
 * iFrame port init
 * @private
 */
PageMod.prototype.__onIframeConnectInit = function() {
  // We use the passbolt part of the location for ifrrame portname
  // e.g. about:blank?passbolt=iframeId
  var iframeId = this.args.include.split('passbolt=')[1];
  iframeId = iframeId.replace('*', '');
  this.portname = iframeId;
  // console.log(this.args.name + ' iframe page mod openening port on ' + this.portname);
  this.__initConnectListener(this.portname, undefined, true);
};

/**
 * Content code port init
 * @private
 */
PageMod.prototype.__onContentConnectInit = function() {
  // We use the content file name as portname
  var portname = this.args.include;
	var replaceStr = chrome.runtime.getURL('/data/');
  portname = portname.replace(replaceStr, '').replace('.html','');
  this.portname = portname;
  // console.log(this.args.name + ' content page mod opening port on ' + this.portname);
  this.__initConnectListener(this.portname);
};

/**
 * When a pagemod is requested on an already opened tab
 *
 * Refresh the page so that it can trigger a proper onTabUpdate
 * so that we have a clean state. Note that we can't just proceed with a onTabUpdate as
 * here might be some scripts already included in the page and we can't remove them
 *
 * @param tab
 * @private
 */
PageMod.prototype.__onAttachExistingTab = function(tab) {
  // We can't insert scripts if the url is not https or http
  // as this is not allowed, instead we insert the scripts manually in the background page if needed
  if (!(tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
    return;
  }

  // if the url match the pagemod requested pattern
  if (tab.url.match(this.args.include)) {
    chrome.tabs.reload(tab.id);
  }
};

/**
 * When a tab is updated
 *
 * @param tabId
 * @param changeInfo
 * @param tab
 * @private
 */
PageMod.prototype.__onTabUpdated = function(tabId, changeInfo, tab) {
  // Mapping tabs statuses from chrome -> firefox
  // loading = start
  // complete = ready|end // default
  var status = 'complete';
  if(typeof this.args.contentScriptWhen !== 'undefined' && this.args.contentScriptWhen === 'start') {
    status = 'loading';
  }

  // When the tab status is marked as complete
  if(changeInfo.status != status) {
    return;
  }

  // We can't insert scripts if the url is not https or http
  // as this is not allowed, instead we insert the scripts manually in the background page if needed
  if (!(tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
    return false;
  }

  // Check if pagemod url pattern match tab url
  if (!this.__checkUrl(tab.url)) {
    return;
  }

  // if there is not already a worker in that tab
  // generate a portname based on the tab it and listen to connect event
  // otherwise reuse the already an active worker in that tab to accept incoming connection
  this.portname = 'port-' + Crypto.uuid(tabId.toString());
  if (this._ports.indexOf(tabId) === -1) {
    this.__initConnectListener(this.portname, tabId);
  }

  // a helper to handle insertion of scripts, variables and css in target page
  var scriptExecution = new ScriptExecution(tabId);

  // set portname in content code as global variable to be used by data/js/port.js
  scriptExecution.setGlobals({portname: this.portname});

  // Set JS global variables if needed
  if (typeof this.args.contentScriptOptions !== 'undefined' && Object.keys(this.args.contentScriptOptions).length) {
    scriptExecution.setGlobals(this.args.contentScriptOptions);
  }

  // Inject JS files if needed
	// TODO don't insert if the JS if its already inserted
  var scripts = this.args.contentScriptFile.slice();
  scriptExecution.injectScripts(scripts);

  // Inject CSS files if needed
  var styles = this.args.contentStyleFile.slice();
  if (styles.length > 0) {
    // TODO don't insert if the CSS is already inserted
    scriptExecution.injectCss(styles);
  }
};

/**
 * Check if a given URL match the pattern provided in the args
 *
 * @param url
 * @returns {boolean}
 * @private
 */
PageMod.prototype.__checkUrl = function(url) {
  if (!(url.match(this.args.include))) {
    // console.debug('Pagemod' + this.args.name + ' URL:' + tab.url + ' do not match ' + this.args.include);
    return false;
  }
  // console.debug('Pagemod' + this.args.name + ' URL:' + tab.url + ' match ' + this.args.include);
  return true;
};

/**
 *
 * A little Factory to match the firefox syntax
 */
var pageMod = function(args) {
  return new PageMod(args);
};
exports.PageMod = pageMod;
