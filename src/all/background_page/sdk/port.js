/**
 * Port Chrome Wrapper
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import Log from "../model/log";
import {v4 as uuidv4} from "uuid";

class Port {
  /**
   * Constructor
   * @param {port} port
   */
  constructor(port) {
    if (!port) {
      throw Error("A port is required.");
    }
    this._listeners = {};
    this._port = port;
    this._port.onMessage.addListener(msg => {
      this._onMessage(msg);
    });
  }

  /**
   * When a message is received on the port
   * Triggers all the callback associated with that message name
   *
   * @param json
   * @private
   */
  _onMessage(json) {
    const msg = JSON.parse(json);
    const eventName = msg[0];
    if (Array.isArray(this._listeners[eventName])) {
      const listeners = this._listeners[eventName];
      for (let i = 0; i < listeners.length; i++) {
        const listener = listeners[i];
        const args = Array.prototype.slice.call(msg, 1);
        listener.callback.apply(this, args);
        if (listener.once) {
          this._listeners[eventName].splice(i, 1);
          // delete the listener if empty array
          if (this._listeners[eventName].length === 0) {
            delete this._listeners[eventName];
          }
          i--; // jump back since i++ is the new i
        }
      }
    }
  }

  /**
   * Add listener for a message name on the current port
   *
   * @param name string
   * @param callback function
   * @param once bool
   * @private
   */
  _addListener(name, callback, once) {
    if (!Array.isArray(this._listeners[name])) {
      this._listeners[name] = [];
    }
    this._listeners[name].push({
      name: name,
      callback: callback,
      once: once
    });
  }

  /**
   * On message name triggers a callback
   *
   * @param name
   * @param callback
   */
  on(name, callback) {
    this._addListener(name, callback, false);
  }

  /**
   * On message name triggers a callback only once,
   * e.g. remove the listener once the message has been received
   *
   * @param name
   * @param callback
   */
  once(name, callback) {
    this._addListener(name, callback, true);
  }

  /**
   * Emit a message to the content code
   * @param requestArgs the arguments
   */
  emit(...requestArgs) {
    const message = JSON.stringify(requestArgs);
    Log.write({level: 'debug', message: `Port emit @ message: ${message}`});
    this._port.postMessage(message);
  }

  /**
   * Emit a message quiet to the content code
   * @param requestArgs the arguments
   */
  async emitQuiet(...requestArgs) {
    const message = JSON.stringify(requestArgs);
    this._port.postMessage(message);
  }

  /**
   * Emit a request to the content code and expect a response.
   * @param message the message
   * @param args the arguments
   * @return Promise
   */
  request(message, ...args) {
    // Generate a request id that will be used by the addon to answer this request.
    const requestId = uuidv4();
    // Add the requestId to the request parameters.
    const requestArgs = [message, requestId].concat(args);

    // The promise that is return when you call passbolt.request.
    return new Promise((resolve, reject) => {
      /*
       * Observe when the request has been completed.
       * Or if a progress notification is sent.
       */
      this.once(requestId, (status, ...callbackArgs) => {
        if (status === 'SUCCESS') {
          resolve.apply(null, callbackArgs);
        } else if (status === 'ERROR') {
          reject.apply(null, callbackArgs);
        }
      });
      // Emit the message to the addon-code.
      this.emit.apply(this, requestArgs);
    });
  }

  /**
   * Disconnect the port
   *
   * @return {void}
   */
  disconnect() {
    this._port.disconnect();
  }
}

export default Port;
