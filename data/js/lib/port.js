/**
 * The passbolt port communication module used on content code side.
 */
var passbolt = passbolt || {};

(function (passbolt) {

  // The port module.
  var port = {},
    // The current listeners.
    messages = {};

  /**
   * Message observer on top of Jquery Callbacks.
   * @param id
   * @returns {*}
   * @constructor
   */
  jQuery.Message = function(id) {
    var callbacks,
      message = id && messages[id];

    if (!message) {
      callbacks = jQuery.Callbacks();
      message = {
        propagate: function() {
          callbacks.fire.apply(null, Array.slice(arguments));
        },
        publish: function() {
          var args = Array.slice(arguments);
          callbacks.fire.apply(null, args);
          // Post the message to the worker.
          args = $.merge([id], args);
          self.port.emit.apply(null, args);
        },
        subscribe: callbacks.add,
        unsubscribe: callbacks.remove,
        disable: callbacks.disable,
        enable: callbacks.enable
      };
      if (id) {
        messages[id] = message;
      }
    }
    return message;
  };

  /**
   * Emit a message on a target worker.
   * @param worker The name of the worker as identified in the main.js (@see the main.js:worker array).
   * @param txt The message to emit.
   * @param [arg1, arg2 ...] (optional) The arguments to pass with the message.
   * @return void
   */
  passbolt.messageOn = function(worker, txt) {
    var args = $.merge(['passbolt.event.dispatch'], Array.slice(arguments));
    self.port.emit.apply(null, args);
  };

  /**
   * Emit a message on a the current worker.
   * @param txt The message to emit to.
   * @return The $.Message object.
   */
  passbolt.message = function(txt) {
    if (!messages[txt]) {
      // Listen to the add-on message.
      self.port.on(txt, function() {
        messages[txt].propagate.apply(null, Array.slice(arguments));
      });
    }
    // The message object to serve to the caller.
    return $.Message(txt);
  };

  passbolt.port = port;

})( passbolt );
