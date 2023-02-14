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
import browser from "webextension-polyfill";

class MessageService {
  constructor() {
    this._listeners = {};
    this._onMessage = this._onMessage.bind(this);
    browser.runtime.onMessage.addListener(this._onMessage);
  }

  /**
   * When a message is received on the content script
   * Triggers all the callback associated with that message name
   *
   * @param msg
   * @private
   */
  async _onMessage(msg) {
    const eventName = msg[0];
    if (typeof this._listeners[eventName] !== 'undefined' && this._listeners[eventName].length > 0) {
      const listeners = this._listeners[eventName];
      for (let i = 0; i < listeners.length; i++) {
        const listener = listeners[i];
        const args = Array.prototype.slice.call(msg, 1);
        await listener.callback.apply(this, args);
      }
    }
  }

  /**
   * Add listener for a message name on the current port
   *
   * @param name string
   * @param callback function
   */
  addListener(name, callback) {
    if (typeof this._listeners[name] === 'undefined') {
      this._listeners[name] = [];
    }
    this._listeners[name].push({
      name: name,
      callback: callback
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
