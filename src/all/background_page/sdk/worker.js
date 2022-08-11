import Log from "../model/log";
import Port from "../sdk/port";
import Tab from "../sdk/tab";

/**
 * PageMod Worker Chrome Wrapper
 *
 * @param port
 * @constructor
 */
const Worker = function(port, tab, iframe, pageMod) {
  this.port = new Port(port);
  this.callbacks = {};
  this.iframe = iframe;
  this.pageMod = pageMod;

  /*
   * make sure the worker self destroy
   * when the tab its running in is closed
   */
  const _this = this;
  if (tab) {
    this.tab = new Tab(tab);
    this.tab.on('removed', () => {
      _this.destroy('tab was closed');
    });
  }

  /*
   * make sure the worker self destroy
   * when it's an iframe worker and the iframe is unloaded
   */
  if (iframe) {
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
Worker.prototype.on = function(eventName, callback) {
  this.callbacks[eventName] = callback;
};

/**
 * Trigger an event listener
 * @param eventName
 */
Worker.prototype.triggerEvent = function(eventName) {
  // Log.write({level: 'debug', message: 'sdk/worker::triggerEvent ' + eventName + ' tab:' + this.tab.id});
  if (typeof this.callbacks[eventName] !== 'undefined') {
    this.callbacks[eventName].apply();
  }
};

/**
 * Destroy the worker
 */
Worker.prototype.destroy = function(reason) {
  Log.write({level: 'debug', message: `sdk/worker::destroy ${this.tab && this.tab.id ? `(tab: ${this.tab.id})` : ""} : ${reason}`});

  // A detach event is fired just before removal.
  this.triggerEvent('detach');

  /*
   * remove the content script from the page
   * Not possible...
   */

  // remove all registered listeners
  if (this.iframe) {
    this.port._port.onDisconnect.removeListener(this.onPortDisconnect);
  }
  if (this.tab) {
    this.tab.destroy();
  }

  //delete this.callbacks;
  delete this.port;
  delete this.tab;
};

export default Worker;
