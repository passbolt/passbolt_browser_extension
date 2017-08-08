
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
      // Log.write({level: 'debug', message: 'Port on @ message: ' + msgName});
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
  // Log.write({level: 'debug', message: 'Port emit @ message: ' + arguments[1]});
  this._port.postMessage(Array.prototype.slice.call(arguments));
};
exports.Port = Port;
