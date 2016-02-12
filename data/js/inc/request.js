/**
 * The passbolt port communication module used on content code side.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var passbolt = passbolt || {};

(function (passbolt) {

  // The current listeners.
  var listeners = {};

  var requestCompletedListener =  function(token, status) {
    var args = Array.slice(arguments, 2);
    if (status == 'SUCCESS') {
      listeners[token].deferred.resolveWith(this, args);
    } else {
      listeners[token].deferred.rejectWith(this, args);
    }
    delete listeners[token];
  };

  var requestProgressListener =  function(token) {
    var args = Array.slice(arguments, 1);
    listeners[token].deferred.notifyWith(this, args);
  };

  passbolt.requestOn = function(worker, message) {
    var token = Math.round(Math.random() * Math.pow(2, 32)),
      args = $.merge(['passbolt.request.dispatch', worker, message, token], Array.slice(arguments, 2)),
      // The callback to execute when the request is completed.
      completedCallback = requestCompletedListener,
      // The callback to execute when the request is in progress.
      progressCallback = requestProgressListener,
      // The deferred object to serve to the caller.
      deferred = $.Deferred();

    // Listen the message add-on return.
    self.port.once(message + '.complete', completedCallback);
    // Listen to the request progress event
    self.port.on(message + '.progress', progressCallback);

    listeners[token] = {
      message: message,
      completedCallback: completedCallback,
      progressCallback: progressCallback,
      deferred: deferred
    };

    // Post the message on the target worker.
    self.port.emit.apply(null, args);

    return deferred;
  };

  passbolt.request = function(message) {
    var token = Math.round(Math.random() * Math.pow(2, 32)),
      args = $.merge([message, token], Array.slice(arguments, 1)),
      // The callback to execute when the request is completed.
      completedCallback = requestCompletedListener,
      // The callback to execute when the request is in progress.
      progressCallback = requestProgressListener,
      // The deferred object to serve to the caller.
      deferred = $.Deferred();

    // Listen to the request completed event.
    self.port.once(message + '.complete', completedCallback);
    // Listen to the request progress event
    self.port.on(message + '.progress', progressCallback);

    listeners[token] = {
      message: message,
      completedCallback: completedCallback,
      progressCallback: progressCallback,
      deferred: deferred
    };

    // Post the message on the worker.
    self.port.emit.apply(null, args);

    return deferred;
  };

})( passbolt );
