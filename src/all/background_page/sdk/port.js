
/**
 * Port Chrome Wrapper
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var Log = require('../model/log').Log;

var Port = function(port) {
  this._port = port;
};

/**
 * On() call a callback for a given message name
 *
 * @param msgName
 * @param callback
 */
Port.prototype.on = function(msgName, callback) {
  var _this = this;
  this._port.onMessage.addListener(function (json) {
    var msg = JSON.parse(json);
    var args = Object.keys(msg).map(function (key) {return msg[key]});
    args = Array.prototype.slice.call(args, 1);
    if (msg[0] === msgName) {
      // TODO create list of blacklisted events
      if(msgName !== 'passbolt.auth.is-authenticated') {
        Log.write({level: 'debug', message: 'Port on @ message: ' + msgName});
      }
      callback.apply(_this, args);
    }
  });
};

/**
 * Send a message to the content code
 *
 * @param msgName string
 * @param token uuid
 * @param status SUCCESS | ERROR
 */
Port.prototype.emit = function () {
  Log.write({level: 'debug', message: 'Port emit @ message: ' + arguments[1]});
  this._port.postMessage(Array.prototype.slice.call(arguments));
};

/**
 * Send a message to the content code
 *
 * @param msgName string
 * @param token uuid
 * @param status SUCCESS | ERROR
 */
Port.prototype.emitQuiet = function () {
  this._port.postMessage(Array.prototype.slice.call(arguments));
};

/**
 * Get an emitable version of a javascript error.
 * Error cannot be transfered by the Port.postMessage function to the content code.
 * Some properties are not iterable/enumerable, such as name or message.
 *
 * @param error {Error} error The error to work on.
 * @pararm {Object} The emitable version of the error.
 */
Port.prototype.getEmitableError = function (error) {
  const emitableError = Object.assign({}, error);
  ["name", "message"].forEach(key => {
    if (error[key] && !emitableError[key]) {
      emitableError[key] = error[key];
    }
  });

  return emitableError;
};

/**
 * Send a message to the content code
 *
 * @param msgName string
 * @param token uuid
 * @param status SUCCESS | ERROR
 */
Port.prototype.request = function (message) {
  Log.write({level: 'debug', message: 'Port request @ message: ' + arguments[1]});
  // The generated requestId used to identify the request.
  const requestId = (Math.round(Math.random() * Math.pow(2, 32))).toString();
  // Add the requestId to the request parameters.
  const requestArgs = [message, requestId].concat(Array.prototype.slice.call(arguments, 1));

  return new Promise((resolve, reject) => {
    this.on(requestId, function(status) {
      const responseArgs = Array.prototype.slice.call(arguments, 1);
      if (status == 'SUCCESS') {
        resolve.apply(null, responseArgs);
      }
      else if (status == 'ERROR') {
        reject.apply(null, responseArgs);
      }
    });
    this.emit.apply(this, requestArgs);
  });
};

exports.Port = Port;
