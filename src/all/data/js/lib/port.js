/**
 * The passbolt content code messaging capabilities
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var self = window.self || {};

(function (self) {
  /**
   * Port Class Constructor
   * @param {string} portname
   * @constructor
   */
  const Port = function (portname) {
    this._listeners = {};

    if (typeof portname !== 'undefined') {
      this._portname = portname;
    } else {
      const msg = 'Port requires a portname to communicate to the addon code.';
      throw Error(msg);
    }

    this._port = chrome.runtime.connect({name: this._portname});
    this._connected = true;

    this._port.onDisconnect.addListener(() => {
      console.warn('port disconnected from addon code: ' + portname);
      this._connected = false;
    });
    this._port.onMessage.addListener((msg) => {
      this._onMessage(msg);
    });
  };

  /**
   * On message name triggers a callback
   *
   * @param {string} name
   * @param {function} callback
   * @return void
   */
  Port.prototype.on = (name, callback) => {
    this._addListener(name, callback, false);
  };

  /**
   * On message name triggers a callback only once,
   * e.g. remove the listener once the message has been received
   *
   * @param {string} name
   * @param {function} callback
   * @return void
   */
  Port.prototype.once = (name, callback) => {
    this._addListener(name, callback, true);
  };

  /**
   * Emit a message to the addon code
   * @return void
   */
  Port.prototype.emit = () => {
    const message = JSON.stringify(arguments);
    this._port.postMessage(message);
  };

  /**
   * Emit a request to the addon code and expect a response.
   * @param {string} message
   * @return {Promise<Object>}
   */
  Port.prototype.request = async (message) => {
    // Generate a request id that will be used by the addon to answer this request.
    const requestId = (Math.round(Math.random() * Math.pow(2, 32))).toString();
    // Add the requestId to the request parameters.
    const requestArgs = [message, requestId].concat(Array.prototype.slice.call(arguments, 1));

    // The promise that is returned when you call passbolt.request.
    return new Promise((resolve, reject) => {
      // Observe when the request has been completed.
      // Or if a progress notification is sent.
      this.once(requestId, function handleResponse(status) {
        const callbackArgs = Array.prototype.slice.call(arguments, 1);
        if (status === 'SUCCESS') {
          resolve.apply(null, callbackArgs);
        }
        else if (status === 'ERROR') {
          reject.apply(null, callbackArgs);
        }
      });

      // Emit the message to the addon-code.
      this.emit.apply(this, requestArgs);
    });
  };

  /*****************************************************************************
   * Protected utilities
   *****************************************************************************/
  /**
   * When a message is received on the port
   * Triggers all the callback associated with that message name
   *
   * @param {string} msg
   * @private
   */
  Port.prototype._onMessage = (msg) => {
    const eventName = msg[0];
    if (typeof this._listeners[eventName] !== 'undefined' && this._listeners[eventName].length > 0) {
      const listeners = this._listeners[eventName];
      for (let i = 0; i < listeners.length; i++) {
        const listener = listeners[i];
        const args = Array.prototype.slice.call(msg, 1);
        listener.callback.apply(this, args);

        if (listener.once) {
          this._listeners[eventName].splice(i, 1);
          i--; // jump back since i++ is the new i
        }
      }
    }
  };

  /**
   * Add listener for a message name on the current port
   *
   * @param {string} name
   * @param {function} callback
   * @param {boolean} once
   * @return void
   * @private
   */
  Port.prototype._addListener = (name, callback, once) => {
    if (typeof this._listeners[name] === 'undefined') {
      this._listeners[name] = [];
    }
    this._listeners[name].push({
      name : name,
      callback : callback,
      once : once
    });
  };

  /**
   * Parse url query variables to allow finding the portname in it
   *
   * @return {Array<string>}
   * @private
   */
  Port._parseUrlQuery = () => {
    const query = window.location.search.substring(1);
    const vars = query.split('&');
    const result = [];
    for (let i = 0; i < vars.length; i++) {
      const pair = vars[i].split('=');
      result[pair[0]] = pair[1];
    }
    return result;
  };

  /*****************************************************************************
   * Bootstrap the self.port object to be used by request and message
   *****************************************************************************/
  /**
   * Port get singleton
   *
   * @param {string} portname
   * @returns {Port}
   */
  Port.get = function(portname) {
    if (typeof self.port === 'undefined' || !self.port._connected) {
      self.port = new Port(portname);
    }
    return self.port;
  };

  /**
   * Create a port instance in self.port as global variable to match the firefox synthax
   * this instance will be used by the message and request objects
   * and subsequently any content code needing to communicate with the addon code
   *
   * @return {Port}
   */
  Port.initPort = function() {
    // Define port name and build singleton
    // if portname is not inserted as variable from addon code (default scenario)
    let port;
    if (typeof portname === 'undefined') {
      // try to get portname for url (Iframe scenario)
      const query = Port._parseUrlQuery();
      if (typeof query['passbolt'] !== 'undefined') {
        port = query['passbolt'];
      } else {
        throw new Error('Portname is not provided in content code');
      }
    } else {
      port = portname;
    }
    return Port.get(port);
  };

  // init port unless told not to
  Port.initPort();

})(self);

window.self = self;
// result must be structured-clonable data
undefined;