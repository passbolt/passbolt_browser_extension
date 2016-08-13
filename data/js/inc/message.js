/**
 * The passbolt communication module used on content code side.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var passbolt = passbolt || {};

(function(passbolt) {

  // Current message stack references.
  var _stack = {};

  // Execute message callbacks.
  var _executeCallbacks = function(message, args) {
    for (var i in _stack[message]) {
      _stack[message][i].apply(null, args);
    }
  };

  passbolt.message = {};

  passbolt.message.emitOn = function(message) {
    var args = ['passbolt.event.dispatch'].concat(Array.slice(arguments));
    self.port.emit.apply(null, args);
  };

  passbolt.message.broadCast = function(message) {
    var args = Array.slice(arguments);
    passbolt.request('passbolt.get_workers')
      .then(function(workersIds){
        for (var i in workersIds) {
          var workerArgs = ['passbolt.event.dispatch', workersIds[i], message].concat(args);
          self.port.emit.apply(null, workerArgs);
        }
      });
  };

  passbolt.message.emit = function(message) {
    // If any callbacks have been attached to the message, execute them.
    if (_stack[message]) {
      // Remove the messsage name from the arguments.
      _executeCallbacks(message, Array.slice(arguments, 1));
    }

    // Emit the message to the worker.
    self.port.emit.apply(null, Array.slice(arguments));
  };

  passbolt.message.on = function(message, callback) {
    // If no listener have been yet attached for this message.
    // * Instantiate a list of callbacks for this message.
    // * Listen to the addon-code message.
    if (!_stack[message]) {
      _stack[message] = [];
      // Once the message is received, execute all the callbacks associated to the
      // message.
      self.port.on(message, function() {
        _executeCallbacks(message, Array.slice(arguments));
      });
    }

    // Add the callback to the stack of callbacks to execute when a message
    // is received.
    _stack[message].push(callback);
  };
})( passbolt );
