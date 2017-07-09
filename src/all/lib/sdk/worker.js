var Port = require('../sdk/port').Port;
var Tab = require('../sdk/tab').Tab;

/**
 * PageMod Worker Chrome Wrapper
 *
 * @param port
 * @constructor
 */
var Worker = function(port, iframe) {
  this.port = new Port(port);
  this.tab = new Tab(port.sender.tab);
  this.callbacks = {};
  this.iframe = iframe;

  // make sure the worker self destroy
  // when the tab its running in is closed
  var _this = this;
  this.tab.on('removed', function () {
    _this.destroy('tab was closed');
  });

  // make sure the worker self destroy
  // when it's an iframe worker and the iframe is unloaded
  if(iframe) {
    this.onPortDisconnect = function() {
      _this.port._port.onDisconnect.removeListener(_this.onPortDisconnect);
      _this.destroy('iframe got unloaded');
    };
    _this.port._port.onDisconnect.addListener(_this.onPortDisconnect);
  }
};

/**
 * Add event listener
 * @param eventName
 * @param callback
 */
Worker.prototype.on = function (eventName, callback) {
  this.callbacks[eventName] = callback;
};

/**
 * Trigger an event listener
 * @param eventName
 */
Worker.prototype.triggerEvent = function (eventName) {
  if (typeof this.callbacks[eventName] !== 'undefined') {
    this.callbacks[eventName].apply();
  }
};

/**
 * Destroy the worker
 */
Worker.prototype.destroy = function (reason) {
  // console.debut('Destroying worker because ' + reason);
  // A detach event is fired just before removal.
  this.triggerEvent('detach');

  // remove the content script from the page
  // Not possible...

  // remove all registered listeners
  if(this.iframe) {
    this.port._port.onDisconnect.removeListener(this.onPortDisconnect);
  }
  this.tab.destroy();

  //delete this.callbacks;
  delete this.port;
  delete this.tab;
};

exports.Worker = Worker;
