/**
 * The passbolt content code messaging capabilities
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var self = self || {};

(function (self) {
  /**
   * Port Class Constructor
   * @param port
   * @constructor
   */
  var Port = function (portname) {
    var _this = this;
    this._i = 0;
    this._listeners = {};

    if(typeof portname !== 'undefined') {
      this._portname = portname;
    } else {
      var msg = 'Port requires a portname to communicate to the addon code.';
      throw Error(msg);
    }
    this._port = chrome.runtime.connect({name: this._portname});
    this._connected = true;

    this._port.onDisconnect.addListener(function(){
      console.warn('port disconnected from addon code: ' + portname);
      _this._connected = false;
    });
    this._port.onMessage.addListener(function(msg) {
      _this._onMessage(msg);
    });
  };

  /**
   * When a message is received on the port
   * Triggers all the callback associated with that message name
   *
   * @param msg
   * @private
   */
  Port.prototype._onMessage = function(msg) {
    var eventName = msg[0];
    if(typeof this._listeners[eventName] !== 'undefined' && this._listeners[eventName].length > 0) {
      var listeners = this._listeners[eventName];
      for(var i = 0; i < listeners.length; i++) {
        var listener = listeners[i];
        var args = Array.prototype.slice.call(msg, 1);
        listener.callback.apply(this, args);

        if(listener.once) {
          this._listeners[eventName].splice(i, 1);
          i--; // jump back since i++ is the new i
        }
      }
    }
  };

  /**
   * Add listener for a message name on the current port
   *
   * @param name string
   * @param callback function
   * @param once bool
   * @private
   */
  Port.prototype._addListener = function(name, callback, once) {
    if(typeof this._listeners[name] === 'undefined') {
      this._listeners[name] = [];
    }
    this._listeners[name].push({
      name : name,
      callback : callback,
      once : once
    });
  };

  /**
   * On message name triggers a callback
   *
   * @param name
   * @param callback
   */
  Port.prototype.on = function(name, callback) {
    this._addListener(name, callback, false);
  };

  /**
   * On message name triggers a callback only once,
   * e.g. remove the listener once the message has been received
   *
   * @param name
   * @param callback
   */
  Port.prototype.once = function(name, callback) {
    this._addListener(name, callback, true);
  };

  /**
   * Emit a message to the addon code
   * @param args
   */
  Port.prototype.emit = function() {
    var message = JSON.stringify(arguments);
    this._port.postMessage(message);
  };

  /*****************************************************************************
   * Protected utilities
   *****************************************************************************/
  /**
   * Generate a port uuid based on tabid
   * @param tabId
   * @returns {string}
   */
  Port._getUuid = function(seed) {
    // healthchecks
    if (typeof seed === 'undefined') {
      throw new Error('portUuid seed should not be null');
    }
    if (typeof jsSHA === 'undefined') {
      throw new Error('jsSHA library is needed in content code to generate portname');
    }

    // Create SHA hash from seed.
    var hashStr;
    var shaObj = new jsSHA('SHA-1', 'TEXT');
    shaObj.update(seed);
    hashStr = shaObj.getHash('HEX').substring(0, 32);

    // Build a uuid based on the hash
    var search = XRegExp('^(?<first>.{8})(?<second>.{4})(?<third>.{1})(?<fourth>.{3})(?<fifth>.{1})(?<sixth>.{3})(?<seventh>.{12}$)');
    var replace = XRegExp('${first}-${second}-3${fourth}-a${sixth}-${seventh}');

    // Replace regexp by corresponding mask, and remove / character at each side of the result.
    var uuid = XRegExp.replace(hashStr, search, replace).replace(/\//g, '');
    return uuid;
  };

  /**
   * Parse url query variables to allow finding the portname in it
   */
  Port._parseUrlQuery = function() {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    var result = [];
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      result[pair[0]] = pair[1];
    }
    return result;
  };

  /*****************************************************************************
   * Bootstrap the self.port object to be used by request and message
   *****************************************************************************/
  /**
   * Port get singleton
   * @returns {Port}
   */
  Port.get = function(portname) {
    if(typeof self.port === 'undefined' || !self.port._connected) {
      self.port = new Port(portname);
    }
    return self.port;
  };

  /**
   * Create a port instance in self.port as global variable to match the firefox synthax
   * this instance will be used by the message and request objects
   * and subsequently any content code needing to communicate with the addon code
   */
  Port.initPort = function() {
    // Define port name and build singleton
    // if portname is not inserted as variable from addon code (default scenario)
    if(typeof portname === 'undefined') {
      // try to get portname for url (Iframe scenario)
      var query = Port._parseUrlQuery();
      if(typeof query['passbolt'] !== 'undefined') {
        portname = query['passbolt'];
      } else {
        throw new Error('Portname is not provided in content code');
      }
    }
    return Port.get(portname);
  };

  // init port unless told not to
  Port.initPort();

})(self);