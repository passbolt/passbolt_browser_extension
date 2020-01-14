/**
 * Progress dialog controller.
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

/**
 * Open the progress dialog.
 *
 * @param {Worker} worker The worker associated with the progress dialog.
 * @param {string} title The progress dialog title.
 * @param {integer} goals Goals to complete
 * @return {Promise}
 */

const open = function (worker, title, goals, message) {
  return worker.port.emit('passbolt.progress.open', title, goals, message);
};
exports.open = open;

/**
 * Update the progress dialog.
 *
 * @param worker The worker associated with the progress dialog.
 * @param completed Number of steps completed
 * @param message (optional) The message to display
 */
const update = function (worker, completed, message) {
  worker.port.emit('passbolt.progress.update', message, completed);
};
exports.update = update;

/**
 * Update the goals of the progress dialog.
 *
 * @param worker The worker associated with the progress dialog.
 * @param goals The new goals
 */
const updateGoals = function (worker, goals) {
  worker.port.emit('passbolt.progress.update-goals', goals);
};
exports.updateGoals = updateGoals;

/**
 * Close the progress dialog.
 *
 * @param worker The worker associated with the progress dialog.
 */
const close = function (worker) {
  worker.port.emit('passbolt.progress.close');
};
exports.close = close;
