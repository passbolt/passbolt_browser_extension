/**
 * The passbolt message is a part of the communication layer used on the
 * content side code to communicate with the addon-code.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var passbolt = passbolt || {};

(function (passbolt) {

  passbolt.message = {};

  // Messages listeners callbacks.
  var _listenersCallbacks = {};

  /**
   * Execute all the callbacks associated to a message listener.
   *
   * @param message {string} The message to notify listeners for
   * @param args {array} Array of arguments to pass to the message handlers
   * @private
   */
  var _executeCallbacks = function (message, args) {
    for (var i in _listenersCallbacks[message]) {
      _listenersCallbacks[message][i].apply(null, args);
    }
  };

  /**
   * Emit a message to the addon code.
   *
   * If any listeners observe this message, execute all the callbacks attached
   * to this message.
   *
   * @param message {string} The message to emit
   */
  passbolt.message.emit = function (message) {
    // If any listener observe this message.
    if (_listenersCallbacks[message]) {
      // Execute all the callbacks associated to this listener.
      _executeCallbacks(message, Array.prototype.slice.call(arguments, 1));
    }

    // Emit the message to the worker.
    self.port.emit.apply(self.port, Array.prototype.slice.call(arguments));
  };

  /**
   * Listen to a message emitted by the addon code, or emmited in the content
   * code.
   *
   * @param message {string} The message to listen for
   * @param callback {function} The callback to execute once a message is received
   */
  passbolt.message.on = function (message, callback) {
    // If no listener observe yet this message.
    if (!_listenersCallbacks[message]) {
      // Instantiate the stack of callbacks for this message.
      _listenersCallbacks[message] = [];
      // Listen to the message from the addon-code.
      self.port.on(message, function () {
        var args = Array.prototype.slice.call(arguments);
        // Execute all the callbacks associated to this listener.
        _executeCallbacks(message, args);
      });
    }

    // Add the callback to the stack of callbacks.
    _listenersCallbacks[message].push(callback);
  };

  /**
   * Emit a message to the page.
   *
   * @param message {string} message name
   * @param data {array} the data associated to the message
   */
  passbolt.message.emitToPage = function (message, data) {
    // Bundle the event data;
    var eventData = {
      event: message,
      data: data
    };
    // The method cloneInto is called only for Firefox.
    // the content script needs to explicitly clone the message payload into
    // the page script's scope using the global cloneInto().
    // @see https://developer.mozilla.org/en-US/Add-ons/SDK/Guides/Content_Scripts/Interacting_with_page_scripts#Content_script_to_page_script_2
    if (typeof cloneInto != 'undefined') {
      eventData = cloneInto(eventData, document.defaultView);
    }
    var event = new CustomEvent('addon-message', { bubbles: true, cancelable: true, detail: eventData });
    document.documentElement.dispatchEvent(event);
  };

  /**
   * Format javascript errors as Passbolt API response.
   *
   * @param {Errror} error The error to format.
   * @return {Object} The formated error
   */
  passbolt.message.formatErrorAsPassboltAPIResponse = function (error) {
    const code = !error.data || !error.data.code ? undefined : error.data.code;
    const body = !error.data || !error.data.body ? undefined : error.data.body;
    return {
      header: {
        code: code,
        status_code: code, // @deprecated from Passsbolt Api v2.7
        status: 'error',
        message: error.message
      },
      body: body
    }
  };

})(passbolt);
