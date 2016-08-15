/**
 * The passbolt message is a part of the communication layer used on the
 * content side code to communicate with the addon-code.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var passbolt = passbolt || {};

(function (passbolt) {

    passbolt.message = {};

    // Current messages listener
    var _stack = {};

    // Execute message callbacks.
    var _executeCallbacks = function (message, args) {
        for (var i in _stack[message]) {
            _stack[message][i].apply(null, args);
        }
    };

    passbolt.message.emitOn = function (message, worker) {
        var args = ['passbolt.event.dispatch'].concat(Array.slice(arguments));
        self.port.emit.apply(null, args);
    };

    passbolt.message.emit = function (message) {
        // If any callbacks have been attached to the message, execute them.
        if (_stack[message]) {
            // Remove the messsage name from the arguments.
            _executeCallbacks(message, Array.slice(arguments, 1));
        }

        // Emit the message to the worker.
        self.port.emit.apply(null, Array.slice(arguments));
    };

    /**
     *
     * @param message
     * @param callback
     */
    passbolt.message.on = function (message, callback) {
        // If no listener have been yet attached for this message.
        // * Instantiate a list of callbacks for this message.
        // * Listen to the addon-code message.
        if (!_stack[message]) {
            _stack[message] = [];
            // Once the message is received, execute all the callbacks associated to the
            // message.
            self.port.on(message, function () {
                _executeCallbacks(message, Array.slice(arguments));
            });
        }

        // Add the callback to the stack of callbacks to execute when a message
        // is received.
        _stack[message].push(callback);
    };

})(passbolt);
