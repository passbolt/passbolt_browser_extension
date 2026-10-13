/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.0.0
 */
import { v4 as uuidv4 } from "uuid";
import Lock from "../../../background_page/utils/lock";

export const PORT_READY_TIMEOUT = 60000;

/**
 * Maximum number of attempts to post a message, reconnecting the port between attempts.
 * @type {number}
 */
export const EMIT_MAX_ATTEMPTS = 3;

class Port {
  /**
   *
   * @param {string} name
   */
  constructor(name) {
    this._listeners = {};
    this.lock = new Lock();
    this.onConnectErrorHandler = {};
    if (typeof name === "undefined") {
      throw Error("A port name is required.");
    } else if (typeof name !== "string") {
      throw Error("The port name should be a valid string.");
    }

    this._name = name;
  }

  /**
   * Connect the port
   * @returns {Promise<>}
   */
  connect() {
    let resolver, rejecter;
    const promise = new Promise((resolve, reject) => {
      resolver = resolve;
      rejecter = reject;
    });
    const isReconnection = Boolean(this._port);
    try {
      this._port = browser.runtime.connect({ name: this._name });
    } catch (error) {
      /**
       * Error happen only if there is no listener in the service worker or if the context is invalidated by an update
       * The call back should remove listeners in content script which still running after an update.
       * In case of a user click manually on the button to update the extension,
       * there is no process to clean the content script, so it prevent issues on a port reconnection.
       */
      this.onConnectErrorHandler.callback();
      throw error;
    }
    this._connected = true;
    this.initListener();
    this.handleReadyOrFailure(this._port, resolver, rejecter, isReconnection);
    return promise;
  }

  /**
   * Settle a connection: resolve once the addon code acknowledges it, reject if the port is disconnected before or if
   * a reconnection is not acknowledged in time. Without it, a connection denied by the addon code would wait forever
   * while holding the connection lock, blocking any further message on this port.
   * @param {object} port The runtime port being connected
   * @param {function} resolve The connection resolver
   * @param {function} reject The connection rejecter
   * @param {boolean} isReconnection Whether the port was connected before, only a reconnection has a maximum delay
   * @private
   */
  handleReadyOrFailure(port, resolve, reject, isReconnection) {
    let isSettled = false;
    const onReady = () => {
      if (isSettled) {
        return;
      }
      isSettled = true;
      clearTimeout(timeout);
      resolve();
    };
    const onFailure = (message) => {
      if (isSettled) {
        return;
      }
      isSettled = true;
      clearTimeout(timeout);
      this.removeListener("passbolt.port.ready", onReady);
      if (this._port === port) {
        this._connected = false;
      }
      port.disconnect();
      reject(new Error(message));
    };
    const timeout = isReconnection
      ? setTimeout(
          () => onFailure(`The port ${this._name} has not been acknowledged by the addon code in time.`),
          PORT_READY_TIMEOUT,
        )
      : null;
    port.onDisconnect.addListener(() =>
      onFailure(`The port ${this._name} has been disconnected before being acknowledged by the addon code.`),
    );
    this.once("passbolt.port.ready", onReady);
  }

  /**
   * Init listener
   * @private
   */
  initListener() {
    const port = this._port;
    port.onDisconnect.addListener(() => {
      if (this._port !== port) {
        return;
      }
      console.warn(`port disconnected from addon code: ${this._name}`);
      this._connected = false;
    });

    port.onMessage.addListener((msg) => {
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
      once: once,
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
   * Removes a listener given its name and its callback
   *
   * @param name
   * @param callback
   */
  removeListener(name, callback) {
    if (!this._listeners?.[name]) {
      return;
    }

    const index = this._listeners[name].findIndex((listener) => listener.callback === callback);
    if (index > -1) {
      this._listeners[name].splice(index, 1);
    }
    if (this._listeners[name].length === 0) {
      delete this._listeners[name];
    }
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
   * Emit a message to the addon code
   * @param requestArgs the arguments
   */
  async emit(...requestArgs) {
    await this.postMessageWithRetry(JSON.stringify(requestArgs));
  }

  /**
   * Post a message, connecting the port first if needed.
   * The port can be dead without its disconnection being received (i.e. the service worker was terminated while the
   * disconnection is not delivered to the page on Edge): reconnect and try again, up to a maximum number of attempts.
   * @param {string} message The serialized message
   * @param {number} [attemptsLeft] The remaining number of attempts
   * @returns {Promise<void>}
   * @throws {Error} If the message cannot be posted after the last attempt
   * @private
   */
  async postMessageWithRetry(message, attemptsLeft = EMIT_MAX_ATTEMPTS) {
    await this.connectIfDisconnected();
    try {
      this._port.postMessage(message);
    } catch (error) {
      if (attemptsLeft <= 1) {
        throw error;
      }
      console.warn(`port found disconnected while emitting: ${this._name}`, error);
      this.markAsDisconnected();
      await this.postMessageWithRetry(message, attemptsLeft - 1);
    }
  }

  /**
   * Flag the current port as disconnected, so the next emit reconnects it.
   * @private
   */
  markAsDisconnected() {
    this._connected = false;
  }

  /**
   * Emit a request to the addon code and expect a response.
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
      const onResponse = (status, ...callbackArgs) => {
        if (status === "SUCCESS") {
          resolve.apply(null, callbackArgs);
        } else if (status === "ERROR") {
          reject.apply(null, callbackArgs);
        }
      };
      this.once(requestId, onResponse);
      // Emit the message to the addon-code, the request fails if it cannot be sent (i.e. the connection is denied).
      this.emit.apply(this, requestArgs).catch((error) => {
        this.removeListener(requestId, onResponse);
        reject(error);
      });
    });
  }

  /**
   * Connect the port if disconnected
   * @returns {Promise<void>}
   */
  async connectIfDisconnected() {
    try {
      await this.lock.acquire();
      if (!this._connected) {
        await this.connect();
      }
    } finally {
      this.lock.release();
    }
  }

  /**
   * Assign a callback on a connect error
   * @param {function} callback The callback
   */
  onConnectError(callback) {
    this.onConnectErrorHandler.callback = callback;
  }
}

export default Port;
