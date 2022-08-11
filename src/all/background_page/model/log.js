/**
 * Log model.
 *
 * The aim of the log model is to offer to developer a way to trace what is happening on the software.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

import {Config} from "./config";

const logSettings = Config.read('log');

// Logs type.
const ERROR = 'error';
const WARNING = 'warning';

// Logs level mapping.
const logLevelMapping = {
  error: 1,
  warning: 2,
  info: 3,
  debug: 4
};

// The stored logs.
let _logs = [];

/**
 * The Logger constructor.
 * @constructor
 */
const Log = function() {};

/**
 * Write a log.
 * @param log {object} The log to write.
 */
Log.write = function(log) {
  // If no logging is required, or the log level is lower than the log level message, leave.
  if (logSettings.level == 0 || logSettings.level < logLevelMapping[log.level]) {
    return;
  }

  // add a timestamp
  function formatTime(i) {
    return (i < 10) ? `0${i}` : i;
  }

  if (!log.date) {
    log.date = new Date();
  }
  const h = formatTime(log.date.getHours());
  const m = formatTime(log.date.getMinutes());
  const s = formatTime(log.date.getSeconds());
  const ms = formatTime(log.date.getMilliseconds());
  log.created =  `${h}:${m}:${s}:${ms}`;

  // Register the log.
  _logs.push(log);

  // The log could also be displayed on the console.
  if (logSettings.console) {
    const consoleLog = `${log.created} [${log.level}] ${log.message}`;
    if (log.level === ERROR) {
      console.error(consoleLog);
    } else if (log.level === WARNING) {
      console.warn(consoleLog);
    } else {
      console.log(consoleLog);
    }
  }
};

/**
 * Flush a log.
 */
Log.init = function() {
  _logs = [];
};

export default Log;
