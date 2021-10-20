/**
 * Progress dialog controller.
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

/**
 * Start a progression.
 *
 * @param {Worker} worker The worker from which the request comes from.
 * @param {string} title The progress title.
 * @param {number} [goals] optional The number of goals to achieve.
 * @param {string} [message] optional start progress message
 * @return {Promise}
 */
const open = async function(worker, title, goals, message) {
  worker.port.emit('passbolt.progress.open-progress-dialog', title, goals, message);
  await delay();
};
exports.open = open;

/*
 * TODO
 * Replace by response from progress worker
 */
const delay = async function(ms) {
  ms = !ms ? 200 : ms;
  return new Promise(resolve => setTimeout(resolve, ms));
};
exports.delay = delay;

/**
 * Complete a progression.
 *
 * @param {Worker} worker The worker from which the request comes from.
 */
const close = async function(worker) {
  worker.port.emit('passbolt.progress.close-progress-dialog');
};
exports.close = close;

/**
 * Update the progress dialog.
 *
 * @param {Worker} worker The worker from which the request comes from.
 * @param completed Number of steps completed
 * @param message (optional) The message to display
 */
const update = async function(worker, completed, message) {
  worker.port.emit('passbolt.progress.update', message, completed);
  await delay();
};
exports.update = update;

/**
 * Update the goals of the progress dialog.
 *
 * @param {Worker} worker The worker from which the request comes from.
 * @param goals The new goals
 */
const updateGoals = function(worker, goals) {
  worker.port.emit('passbolt.progress.update-goals', goals);
};
exports.updateGoals = updateGoals;
