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
 * @since         4.0.0
 */

class MessageService {
  constructor() {
    // Null-prototype map so a message whose event name is a prototype member
    // ("constructor", "__proto__", "hasOwnProperty") resolves to undefined and is
    // declined, rather than matching an Object.prototype function and being claimed.
    this._listeners = Object.create(null);
    this._onMessage = this._onMessage.bind(this);
    browser.runtime.onMessage.addListener(this._onMessage);
  }

  /**
   * When a message is received on the content script.
   *
   * Triggers all the callbacks associated with that message name.
   *
   * Returns a Promise ONLY for events this service actually owns (has a registered
   * listener for). The webextension-polyfill keeps the message channel open while a
   * listener returns a thenable and then resolves it, so returning the dispatch Promise
   * preserves a load-bearing timing contract: callers such as WorkerService.get await
   * "passbolt.port.connect" and then synchronously read the (by then reconnected) port.
   *
   * For any other message it returns undefined SYNCHRONOUSLY, so the polyfill declines
   * the message (closes the channel) instead of holding it open and resolving it to
   * null. Without this, an async listener claims and nulls EVERY runtime.sendMessage
   * broadcast on this shared bus, hijacking the reply of unrelated senders, e.g. the
   * service worker's automation message API, whose real reply would otherwise lose the
   * single-response race to this content-script context.
   *
   * @param {array} msg the [eventName, ...args] content-script event
   * @returns {Promise<void>|undefined} a Promise for owned events, undefined otherwise
   * @private
   */
  _onMessage(msg) {
    const eventName = msg?.[0];
    const listeners = this._listeners[eventName];
    if (typeof listeners === "undefined" || listeners.length === 0) {
      // Not an event this content script owns: decline without claiming the response
      // channel (return undefined synchronously, never a Promise, never throw).
      return undefined;
    }
    return this._dispatch(listeners, msg);
  }

  /**
   * Dispatch a matched content-script event to its registered listeners, in order.
   *
   * @param {array} listeners the listeners registered for the event
   * @param {array} msg the [eventName, ...args] content-script event
   * @returns {Promise<void>}
   * @private
   */
  async _dispatch(listeners, msg) {
    const args = Array.prototype.slice.call(msg, 1);
    for (let i = 0; i < listeners.length; i++) {
      await listeners[i].callback.apply(this, args);
    }
  }

  /**
   * Add listener for a message name on the current port
   *
   * @param name string
   * @param callback function
   */
  addListener(name, callback) {
    if (typeof this._listeners[name] === "undefined") {
      this._listeners[name] = [];
    }
    this._listeners[name].push({
      name: name,
      callback: callback,
    });
  }

  /**
   * Resolve the mesage in case of success.
   * @param {any} response the response payload
   * @return {Promise<any>}
   */
  success(response) {
    return Promise.resolve(response);
  }

  /**
   * Reject the message in case of error.
   * @param {any} error the error payload
   * @return {Promise<any>}
   */
  error(error) {
    return Promise.reject(error);
  }
}

export default MessageService;
