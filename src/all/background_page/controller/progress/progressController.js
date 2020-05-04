/**
 * Progress dialog controller.
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

const Worker = require('../../model/worker');

/**
 * Start a progression.
 *
 * @param {Worker} worker The worker from which the request comes from.
 * @param {string} title The progress title.
 * @param {number} goals The number of goals to achieve.
 * @param {string} message start progress message
 * @return {Promise}
 */
const open = async function (worker, title, goals, message) {
  // If the source of the request is a legacy worker then display the react app that will be in charge of
  // treating the progress events.
  if (worker.isLegacyWorker()) {
    const appWorker = Worker.get('App', worker.tab.id);
    appWorker.port.emit('passbolt.app.show');
  }
  const progressWorker = getProgressWorker(worker);
  progressWorker.port.emit('passbolt.progress.open-progress-dialog', title, goals, message);
  await delay();
};
exports.open = open;

// TODO
// Replace by response from progress worker
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
const close = async function (worker) {
  const progressWorker = getProgressWorker(worker);
  progressWorker.port.emit('passbolt.progress.close-progress-dialog');

  // If the source of the request is a legacy worker then hide the react app.
  if (worker.isLegacyWorker()) {
    const appWorker = Worker.get('App', worker.tab.id);
    appWorker.port.emit('passbolt.app.hide');
  }
};
exports.close = close;

/**
 * Update the progress dialog.
 *
 * @param {Worker} worker The worker from which the request comes from.
 * @param completed Number of steps completed
 * @param message (optional) The message to display
 */
const update = async function (worker, completed, message) {
  const progressWorker = getProgressWorker(worker);
  progressWorker.port.emit('passbolt.progress.update', message, completed);
  await delay();
};
exports.update = update;

/**
 * Update the goals of the progress dialog.
 *
 * @param {Worker} worker The worker from which the request comes from.
 * @param goals The new goals
 */
const updateGoals = function (worker, goals) {
  const progressWorker = getProgressWorker(worker);
  progressWorker.port.emit('passbolt.progress.update-goals', goals);
};
exports.updateGoals = updateGoals;

/**
 * The progress dialog is now managed by the new react application.
 * The treatment of the requests coming from any legacy worker (Import, Export) should be delegated to the new
 * react application.
 * @param {Worker} worker The source worker.
 * @return {Worker}
 */
const getProgressWorker = function (worker) {
  if (worker.isLegacyWorker()) {
    return Worker.get('ReactApp', worker.tab.id);
  }

  return worker;
};
