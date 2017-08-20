/**
 * Progress dialog controller.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var Worker = require('../model/worker');

/**
 * Open the progress dialog.
 *
 * @param worker The worker associated with the progress dialog.
 * @param title The progress dialog title.
 * @param toComplete Number of steps to complete the progression.
 */
var open = function (worker, title, toComplete) {
  worker.port.emit('passbolt.progress.open-dialog', title, toComplete);
};
exports.open = open;

/**
 * Update the progress dialog.
 *
 * @param worker The worker associated with the progress dialog.
 * @param completed Number of steps completed
 * @param message (optional) The message to display
 */
var update = function (worker, completed, message) {
  var progressWorker = Worker.get('Progress', worker.tab.id);
  if (progressWorker) {
    progressWorker.port.emit('passbolt.progress.update', message, completed);
  }
};
exports.update = update;

/**
 * Update the goals of the progress dialog.
 *
 * @param worker The worker associated with the progress dialog.
 * @param goals The new goals
 */
var updateGoals = function (worker, goals) {
  var progressWorker = Worker.get('Progress', worker.tab.id);
  if (progressWorker) {
    progressWorker.port.emit('passbolt.progress.update-goals', goals);
  }
};
exports.updateGoals = updateGoals;

/**
 * Close the progress dialog.
 *
 * @param worker The worker associated with the progress dialog.
 */
var close = function (worker) {
  worker.port.emit('passbolt.progress.close-dialog');
};
exports.close = close;
