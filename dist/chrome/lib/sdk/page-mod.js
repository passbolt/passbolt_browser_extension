/**
 * PageMod Chrome Wrapper
 * Allow using pagemods in chrome almost like firefox sdk
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var ScriptExecution = require('vendors/scriptExecution').ScriptExecution;
var Crypto = require('model/crypto').Crypto;

var Worker = require('sdk/worker').Worker;
var self = require('sdk/self');

/**
 * PageMod Chrome Wrapper
 *
 * @param args
 * @constructor
 */
var PageMod = function(args) {
  this.args = args;
  this._tabs = []; // list of tab ids in which the pagemod has a worker
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
  console.log('PageMod::destroy not implemented');
};

/**
 * Private function
 * Not part of Firefox SDK
 */
/**
 * PageMod Init
 */
PageMod.prototype.__init = function() {
  // The url to use for the pageMod include is not a regex, create one
  if(!(this.args.include instanceof RegExp)) {
    if(this.args.include === '*') {
      this.args.include = new RegExp('.*');
    } else {
      if (this.args.include.startsWith('about:blank')) {
        // For URL patterns like 'about:blank?passbolt=passbolt-iframe*'
        // Contrarily to Firefox we do not inject scripts in the page
        // They are loaded via chrome-extension://[pluginid]/js/iframe.html templates
        // We wait for the page mod to initiate the connection
        this.__onIframeConnectInit();
        return;
      } else {
        this.args.include = new RegExp(this.args.include);
      }
    }
  }

  // When a tab is updated we try to insert content code if it matches
  // the include and contentScriptWhen pageMod parameters
  var _this = this;
  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    _this.__onTabUpdated(tabId, changeInfo, tab);
  });

  // Sometimes the page is loaded from the cache and the 'onUpdate' listener is
  // not fired. To make sure we cover that case we listen to 'onReplaced' events
  // fired when a tab is replaced with another tab due to prerendering or instant.
  // see. https://bugs.chromium.org/p/chromium/issues/detail?id=109557
  chrome.tabs.onReplaced.addListener(function (addedTabId, removedTabId) {
    chrome.tabs.get(addedTabId, function(tab){
      _this.__onTabUpdated(tab.id, {status:'complete'}, tab);
    });
  });

  // Using attachto a pagemod can be launched to an already opened tab
  // Useful after an install or a reinstall
  // see. attachTo: ["existing", "top"]
  // Existing = attach to already opened tab (default not)
  // Top = attach to only top document and not iframes (we can't attach to iframe in chrome anyway)
  if(typeof this.args.attachTo !== 'undefined') {
    chrome.tabs.query({}, function(tabs){
      tabs.forEach(function(tab){
        _this.__onTabUpdated(tab.id, {status:'complete'}, tab);
      });
    });
  }

  // When a tab is closed cleanup we cleanup
  chrome.tabs.onRemoved.addListener(function (tabId) {
    var index = _this._tabs.indexOf(tabId);
    _this._tabs.splice(index, 1);
  });
};

/**
 * Manage runtime.onConnect listeners
 *
 * @private
 */
PageMod.prototype.__initConnectListener = function(portName, tabId) {
  var _this = this;

  function connected(port) {
    // check if the portname match
    if(port.name === portName) {
      // add the sender tab id to the list of active tab for that worker
      if(typeof tabId === 'undefined' || tabId === port.sender.tab.id) {
        _this._tabs.push(port.sender.tab.id);
        _this.__onConnect(port);
      }
    }
  }
  chrome.runtime.onConnect.addListener(connected);
};

/**
 * iFrame port init
 * @private
 */
PageMod.prototype.__onIframeConnectInit = function() {
  // We use the passbolt part of the location for ifrrame portname
  // e.g. about:blank?passbolt=iframeId
  var iframeId = this.args.include.split('passbolt=')[1];
  this.portname = iframeId;
  this.__initConnectListener(this.portname);
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

  // When the tab status match the one requested in the args
  if(changeInfo.status === status) {

    // if the url match the pagemod requested pattern
    if (tab.url.match(this.args.include)) {

      // if there is not already a worker in that tab
      // generate a portname based on the tab it and listen to connect event
      // otherwise reuse the already an active worker in that tab to accept incoming connection
      this.portname = 'port-' + Crypto.uuid(tabId.toString());
      if (this._tabs.indexOf(tabId) === -1) {
        console.log('init: ' + this.portname);
        this.__initConnectListener(this.portname, tabId);
      }

      // We can't insert scripts if the url is chrome-extension://
      // as this is not allowed, instead we insert the scripts manually in the background page
      // if needed
      if(tab.url.startsWith(self.data.url())){
        return true;
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
      var scripts = [];
      if (typeof this.args.contentScriptFile !== 'undefined' && this.args.contentScriptFile.length) {
        scripts = this.args.contentScriptFile.slice();
        // remove chrome-extension baseUrl from self.data.url
        // since when inserted in a page the url are relative to /data already
        var replaceStr = 'chrome-extension://' + chrome.runtime.id + '/data/';
        scripts = scripts.map(function(x){return x.replace(replaceStr, '');});
      }

      // TODO don't insert if the JS if its already inserted
      scripts.unshift('js/lib/port.js'); // add a firefox-like self.port layer
      scriptExecution.injectScripts(scripts);

      // Inject CSS files if needed
      if (typeof this.args.contentStyleFile !== 'undefined' && this.args.contentStyleFile.length) {
        // TODO don't insert if the CSS is already inserted
        scriptExecution.injectCss(this.args.contentStyleFile);
      }
    }
  }
};

/**
 * When a content code connect to the port
 * Triggers onAttach callback so that events from lib/event can be triggered
 * if the pageMod / worker is set to listen to them
 *
 * @param port
 */
PageMod.prototype.__onConnect = function(port) {
  var worker = new Worker(port);
  this.args.onAttach(worker);
};

/**
 *
 * A little Factory to match the firefox syntax
 */
var pageMod = function(args) {
  return new PageMod(args);
};
exports.PageMod = pageMod;
