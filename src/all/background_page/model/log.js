/**
 * Log model.
 *
 * The aim of the log model is to offer to developer a way to trace what is happening on the software.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var Config = require('./config');
var logSettings = Config.read('log');

// Logs type.
var ERROR = 'error';
exports.ERROR = ERROR;
var WARNING = 'warning';
exports.WARNING = WARNING;
var INFO = 'info';
exports.INFO = INFO;
var DEBUG = 'debug';
exports.DEBUG = DEBUG;

// Logs level mapping.
var logLevelMapping = {
  error: 1,
  warning: 2,
  info: 3,
  debug: 4
};

// The stored logs.
var _logs = [];
exports._logs = _logs;

/**
 * The Logger constructor.
 * @constructor
 */
var Log = function () {};

/**
 * Get all the logs.
 * @returns {*}
 */
Log.readAll = function () {
  return _logs;
};

/**
 * Write a log.
 * @param log {object} The log to write.
 */
Log.write = function (log) {
  // If no logging is required, or the log level is lower than the log level message, leave.
  if (logSettings.level == 0 || logSettings.level < logLevelMapping[log.level]) {
    return;
  }

  // add a timestamp
  function formatTime(i) {
    return (i < 10) ? "0" + i : i;
  }
  var today = new Date(),
    h = formatTime(today.getHours()),
    m = formatTime(today.getMinutes()),
    s = formatTime(today.getSeconds());
  log.created =  h + ':' + m + ':' + s;

  // Register the log.
  _logs.push(log);

  // The log could also be displayed on the console.
  if (logSettings.console) {
    var consoleLog = log.created + ' [' + log.level + '] ' + log.message;
  }
};

/**
 * Flush a log.
 */
Log.flush = function () {
  _logs = [];
};

exports.Log = Log;
