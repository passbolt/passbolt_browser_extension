
/**
 * Port Chrome Wrapper
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
require('../error/error.js');
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
  const message = arguments[1] || arguments[0];
  Log.write({level: 'debug', message: 'Port emit @ message: ' + message});
  const args = Array.prototype.slice.call(arguments)
    .map(arg => (arg && typeof arg.toJSON === "function") ? arg.toJSON() : arg);
  this._port.postMessage(args);
};

/**
 * Send a message to the content code
 *
 * @param msgName string
 * @param token uuid
 * @param status SUCCESS | ERROR
 */
Port.prototype.emitQuiet = function () {
  const args = Array.prototype.slice.call(arguments)
    .map(arg => (arg && typeof arg.toJSON === "function") ? arg.toJSON() : arg);
  this._port.postMessage(args);
};

/**
 * Send a message to the content code
 *
 * @param {string} message
 */
Port.prototype.request = async function (message) {
  Log.write({level: 'debug', message: 'Port request @ message: ' + arguments[1]});
  // The generated requestId used to identify the request.
  const requestId = (Math.round(Math.random() * Math.pow(2, 32))).toString();
  // Add the requestId to the request parameters.
  const requestArgs = [message, requestId].concat(Array.prototype.slice.call(arguments, 1));

  return new Promise((resolve, reject) => {
    this.on(requestId, function(status) {
      const responseArgs = Array.prototype.slice.call(arguments, 1);
      if (status === 'SUCCESS') {
        resolve.apply(null, responseArgs);
      }
      else if (status === 'ERROR') {
        reject.apply(null, responseArgs);
      }
    });
    this.emit.apply(this, requestArgs);
  });
};

/**
 * onDestroyed() called when the port is destroyed
 *
 * @param callback
 */
Port.prototype.onDisconnect = function(callback) {
  this._port.onDisconnect.addListener(() => {
    callback()
  });
};

exports.Port = Port;
