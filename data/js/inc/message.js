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

    // Messages listeners callbacks.
    var _listenersCallbacks = {};

	/**
     * Execute all the callbacks associated to a message listener.
     *
     * @param message
     * @param args
     * @private
     */
    var _executeCallbacks = function (message, args) {
        for (var i in _listenersCallbacks[message]) {
            _listenersCallbacks[message][i].apply(null, args);
        }
    };

	/**
     * Emit a message to a target worker.
     *
     * @param message The message to emit
     * @param worker The target worker to emit the message to
     */
    passbolt.message.emitOn = function (message, worker) {
        var args = ['passbolt.event.dispatch'].concat(Array.slice(arguments));
        self.port.emit.apply(null, args);
    };

	/**
     * Emit a message to the addon code.
     *
     * If any listener observe this message, execute all the callbacks attached
     * to this message.
     *
     * @param message
     */
    passbolt.message.emit = function (message) {
        // If any listener observe this message.
        if (_listenersCallbacks[message]) {
            // Execute all the callbacks associated to this listener.
            _executeCallbacks(message, Array.slice(arguments, 1));
        }

        // Emit the message to the worker.
        self.port.emit.apply(null, Array.slice(arguments));
    };

    /**
     * Listen to a message emitted by the addon code, or emmited in the content
     * code.
     *
     * @param message The message to listen for
     * @param callback The callback to execute once a message is received
     */
    passbolt.message.on = function (message, callback) {
        // If no listener observe yet this message.
        if (!_listenersCallbacks[message]) {
            // Instantiate the stack of callbacks for this message.
            _listenersCallbacks[message] = [];
            // Listen to the message from the addon-code.
            self.port.on(message, function () {
                // Execute all the callbacks associated to this listener.
                _executeCallbacks(message, Array.slice(arguments));
            });
        }

        // Add the callback to the stack of callbacks.
        _listenersCallbacks[message].push(callback);
    };

})(passbolt);
