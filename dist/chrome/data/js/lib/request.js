/**
 * The passbolt request is a part of the communication layer used on the
 * content side code to make requests to the addon-code.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var passbolt = passbolt || {};

(function (passbolt) {

  /**
   * Stack of pending requests references.
   *
   * @type {array}
   */
  var _stack = {};

  /**
   * Perform an asynchronous request to the addon-code.
   *
   * By default there is no mechanism to
   *
   * The object returned by the request function is a jQuery.Deferred. The
   * object is chainable, similar to the way a jQuery object is chainable. You
   * can use any of the methods mentioned in the following documentation :
   * @see http://api.jquery.com/category/deferred-object/
   *
   * The returned jQuery.Deferred object is resolved once the addon-code
   * has processed the request and has sent back a response.
   *
   * How does it work ?
   * ------------------
   *
   * 1. Make a request to the addon-code
   *
   * To make a request to the addon-code, you can do as following
   *
   * ```
   * passbolt.request('request_name')
   *   .then(function(response_arg1, response_arg2) {
   *     // Do something in case of success
   *   })
   *   .then(null, function(response_arg1, response_arg2) {
   *     // Do something in case of failure
   *   });
   *
   * 1.1 How the request layer is implemented
   *
   * For each request a token is generated. This token will help to identify
   * each request and its associated callbacks and ensure the resolution of the
   * good callbacks once the request is completed.
   *
   * The token is added as parameter and should be sent back in the addon code
   * response.
   *
   * The request layer use the Firefox communication mechanism with the port
   * object to trigger the request.
   *
   * ```
   * self.port.emit('request_name', token [, arg1, arg2 ..]);
   * ```
   *
   * 2. Addon-code response
   *
   * The addon-code should send a response to all requests disregard of the
   * status. The format of the response is as follow.
   *
   * 2.1 In case of error
   *
   * ```
   * worker.port.emit('request_name.complete', token, 'ERROR' [, arg1, arg2 ..]);
   * ```
   *
   * 2.1 In case of success
   *
   * ```
   * worker.port.emit('request_name.complete', token, 'SUCCESS' [, arg1, arg2 ..]);
   * ```
   *
   * 2.1 Following the progress of a request
   *
   * ```
   * worker.port.emit('request_name.progress', token, 'PROGRESS' [, arg1, arg2 ..]);
   * ```
   *
   * 3. Treatment of the response by the content code
   *
   * Once the content code receives the request response, it execute the
   * callbacks that have been associated to the request. It is able to
   * retrieve the references with the token that is exchanged between the
   * addon-code and the content code.
   *
   * @param message The request name
   * @returns {jQuery.Deferred}
   */
  passbolt.request = function(message) {
    // The promise that is return when you call passbolt.request.
    var deferred = $.Deferred(),
    // The generated token used to identify the request.
      token = Math.round(Math.random() * Math.pow(2, 32)),
    // Add the token to the request parameters.
      args = [message, token].concat(Array.prototype.slice.call(arguments, 1)),
    // The callback to execute when the request is completed, disregard
    // of the result.
      completedCallback = _requestCompletedListener,
    // The callback to execute when the request is in progress.
      progressCallback = _requestProgressListener;

    // Observe when the request has been completed.
    self.port.once(message + '.complete', completedCallback);
    // Observe when the add-on code sent progress message regarding the
    // request.
    self.port.on(message + '.progress', progressCallback);

    // Add the request to the stack of pending requests.
    _stack[token] = {
      // The request message.
      message: message,
      // The message response.
      messageResponse: message,
      // The resolution/rejection request callback.
      completedCallback: completedCallback,
      // The progress request callback.
      progressCallback: progressCallback,
      // The request associated deferred.
      deferred: deferred
    };

    // Emit the message to the addon-code.
    self.port.emit.apply(self.port, args);

    return deferred;
  };

  /**
   * When a request has been completed by the addon-code, and response sent
   * to the content code, this callback is executed. It resolves/rejects the
   * promise associated to the request regarding the addon-code response
   * status.
   *
   * @param token The token sent with the request, must be sent back in the
   * response. It permits to identify which requests to process.
   *
   * @param status The status of the response. It can be SUCCESS or ERROR.
   *
   * @param args following arguments will be passed to the deferred resolution
   * rejection call.
   */
  var _requestCompletedListener =  function(token, status) {
    console.log(status);
    var args = Array.prototype.slice.call(arguments, 2);
    if (status == 'SUCCESS') {
      _stack[token].deferred.resolveWith(this, args);
    } else {
      _stack[token].deferred.rejectWith(this, args);
    }
    // @TODO Remove the progress listener.
    delete _stack[token];
  };

  /**
   * When a request send progress events, this callback is executed. It
   * notifies the deferred associated to the request about the progress.
   *
   * @param token The token sent with the request, must be sent back in the
   * progress. It permits to identify the deferred to notify.
   *
   * @param args following arguments will be passed to the deferred
   * progress call.
   */
  var _requestProgressListener = function(token) {
    var args = Array.prototype.slice.call(arguments, 1);
    _stack[token].deferred.notifyWith(this, args);
  };

})( passbolt );
