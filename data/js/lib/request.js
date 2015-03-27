/**
 * The passbolt port communication module used on content code side.
 */
var passbolt = passbolt || {};

(function (passbolt) {

  // The current listeners.
  var listeners = {};

  var requestResultListener =  function(token, status) {
    var args = Array.slice(arguments, 2);
    if (status == 'SUCCESS') {
      listeners[token].deferred.resolveWith(this, args);
    } else {
      listeners[token].deferred.rejectWith(this, args);
    }
    delete listeners[token];
  };

  passbolt.requestOn = function(worker, message) {
    var token = Math.round(Math.random() * Math.pow(2, 32)),
      args = $.merge(['passbolt.request.dispatch', worker, message, token], Array.slice(arguments, 2)),
      // The function which will take care of the message add-on return.
      func = requestResultListener,
      // The deferred object to serve to the caller.
      deferred = $.Deferred();

    // Listen the message add-on return.
    self.port.once(message + '.complete', func);

    listeners[token] = {
      message: message,
      func: func,
      deferred: deferred
    };

    // Post the message on the target worker.
    self.port.emit.apply(null, args);

    return deferred;
  };

  passbolt.request = function(message) {
    var token = Math.round(Math.random() * Math.pow(2, 32)),
      args = $.merge([message, token], Array.slice(arguments, 1)),
      // The function which will take care of the message add-on return.
      func = requestResultListener,
      // The deferred object to serve to the caller.
      deferred = $.Deferred();

    // Listen the message add-on return.
    self.port.once(message + '.complete', func);

    listeners[token] = {
      message: message,
      func: func,
      deferred: deferred
    };

    // Post the message on the worker.
    self.port.emit.apply(null, args);

    return deferred;
  };

})( passbolt );
