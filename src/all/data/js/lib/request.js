/**
 * The passbolt request is a part of the communication layer used on the
 * content side code to make requests to the addon-code.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var passbolt = window.passbolt || {};

(function (passbolt) {

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
   * For each request a request identifier is generated. This identifier will
   * help to identify each request and its associated callbacks and ensure
   * the resolution of the good callbacks once the request is completed.
   *
   * The request identifier is added as parameter and should be sent back in
   * the addon code response.
   *
   * The request layer use the Firefox communication mechanism with the port
   * object to trigger the request.
   *
   * ```
   * self.port.emit('request_name', requestId [, arg1, arg2 ..]);
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
   * worker.port.emit(requestId, 'ERROR' [, arg1, arg2 ..]);
   * ```
   *
   * 2.1 In case of success
   *
   * ```
   * worker.port.emit(requestId, 'SUCCESS' [, arg1, arg2 ..]);
   * ```
   *
   * 2.1 Following the progress of a request
   *
   * ```
   * worker.port.emit(requestId, 'PROGRESS' [, arg1, arg2 ..]);
   * ```
   *
   * 3. Treatment of the response by the content code
   *
   * Once the content code receives the request response, it execute the
   * callbacks that have been associated to the request. It is able to
   * retrieve the references with the request identifier that is exchanged
   * between the addon-code and the content code.
   *
   * @param message {string} The request name
   * @returns {Promise}
   */
  passbolt.request = function(message) {
    // The generated requestId used to identify the request.
    const requestId = (Math.round(Math.random() * Math.pow(2, 32))).toString();
    // Add the requestId to the request parameters.
    const requestArgs = [message, requestId].concat(Array.prototype.slice.call(arguments, 1));

    // The promise that is return when you call passbolt.request.
    return new Promise((resolve, reject) => {
      // Observe when the request has been completed.
      // Or if a progress notification is sent.
      self.port.once(requestId, function handleResponse(status) {
        const callbackArgs = Array.prototype.slice.call(arguments, 1);
        if (status == 'SUCCESS') {
          resolve.apply(null, callbackArgs);
        }
        else if (status == 'ERROR') {
          reject.apply(null, callbackArgs);
        }
      });

      // Emit the message to the addon-code.
      self.port.emit.apply(self.port, requestArgs);
    });
  };

})( passbolt );

window.passbolt = passbolt;

// result must be structured-clonable data
undefined;