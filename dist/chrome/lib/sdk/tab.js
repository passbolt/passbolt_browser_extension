/**
 * Port Chrome Wrapper
 *
 * @param port
 * @constructor
 */
var Tab = function(tab) {
  this._tab = tab;
  this.id = tab.id;
  this.url = tab.url;
  this.callbacks = {};

  var _this = this;

  // setup on ready event
  this._onTabUpdated = function (tabId, changeInfo, tab) {
    // if tab is the same than the current worker tab
    // and is fully loaded
    if(_this.id == tabId && changeInfo.status == 'complete') {
      _this.triggerEvent('ready', tab);
    }
  };
  chrome.tabs.onUpdated.addListener(this._onTabUpdated);

  // setup on removed event
  this._onTabRemoved = function (tabId) {
    if(_this.id == tabId) {
      chrome.tabs.onRemoved.removeListener(_this.onTabRemoved);
      _this.triggerEvent('removed', tab);
    }
  };
  chrome.tabs.onRemoved.addListener(this._onTabRemoved);
};

/**
 * Destroy the tab listeners
 * Called when the worker is destroyed
 */
Tab.prototype.destroy = function() {
  chrome.tabs.onUpdated.removeListener(this._tabUpdated);
  chrome.tabs.onRemoved.removeListener(this._onTabRemoved);
};

/**
 * Add an event listener
 *
 * @param eventName
 * @param callback
 */
Tab.prototype.on = function(eventName, callback) {
  this.callbacks[eventName] = callback;
};

/**
 * Remove an event listener
 *
 * @param eventName
 */
Tab.prototype.removeListener = function(eventName) {
  delete this.callbacks[eventName];
};

/**
 * Trigger an event
 *
 * @param eventName
 */
Tab.prototype.triggerEvent = function (eventName) {
  if (typeof this.callbacks[eventName] !== 'undefined') {
    var args = Array.prototype.slice.call(arguments, 1);
    this.callbacks[eventName].apply(this, args);
  }
};

exports.Tab = Tab;
