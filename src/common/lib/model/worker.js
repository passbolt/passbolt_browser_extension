/**
 * The aim of the worker model is to manage instantiated workers.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var app = require('../main');

/**
 * Reference a worker.
 * @param workerId {string} The worker identifier
 * @param worker {Worker} The worker to reference
 * @param options {array} Optional data
 */
var add = function (workerId, worker, options) {
  console.debug('add worker ' + workerId);
  options = options || {};
  var removeOnTabUrlChange = options.removeOnTabUrlChange || true,
    url = worker.tab.url;

  if (exists(workerId, worker.tab.id)) {
    console.warn('[WARNING] the worker ' + workerId + ' already exists, it has been added but weird behaviors are expected.');
  }

  // Add the worker to the list of active app workers.
  if (typeof app.workers[worker.tab.id] == 'undefined') {
    app.workers[worker.tab.id] = {};
  }
  app.workers[worker.tab.id][workerId] = worker;

  // Listen to worker detached.
  var onWorkerDetachHandler = function () {
    if (exists(workerId, worker.tab.id)) {
      remove(workerId, worker.tab.id, options);
    }
  };
  worker.on('detach', onWorkerDetachHandler);

  // Listen to tab url changes.
  var onTabReadyHandler = function (tab) {
    if (url != tab.url) {
      // If callback given in option
      if (options.onTabUrlChange) {
        options.onTabUrlChange(worker);
      }

      // If the worker should be destroyed on tab change.
      if (removeOnTabUrlChange) {
        worker.tab.removeListener('ready', onTabReadyHandler);
        worker.destroy();
      }
    }
  };
  worker.tab.on('ready', onTabReadyHandler);
};
exports.add = add;

/**
 * Unreference a worker.
 * @param tabId {string} The tab identifier on which the worker runs
 * @param workerId {string} The worker identifier
 * @param options {array} Optional parameters
 *  - options.onDestroy {function} Callback to execute when the worker is
 *    destroyed.
 */
var remove = function (workerId, tabId, options) {
  if (!exists(workerId, tabId)) {
    console.warn('[WARNING] Unable to remove the worker ' + workerId + ', it doesn\'t exist on the tab ' + tabId + ' .');
  } else {
    console.debug('remove worker ' + workerId);
    delete app.workers[tabId][workerId];
    if (options.onDestroy) {
      options.onDestroy();
    }
  }
};

/**
 * Get a worker.
 * @param workerId {string} The worker identifier
 * @param tabId {string} The tab identifier on which the worker runs
 * @return {Worker} null if the worker doesn't exist.
 */
var get = function (workerId, tabId) {
  if (app.workers[tabId][workerId]) {
    return app.workers[tabId][workerId];
  }
  return null;
};
exports.get = get;

/**
 * Get all workers identifiers instantiated on a tab.
 * @param tabId {string} The tab identifier
 * @return {array}
 */
var getAllKeys = function (tabId) {
  return Object.keys(app.workers[tabId]);
};
exports.getAllKeys = getAllKeys;

/**
 * Checks that a worker exists.
 * @param workerId {string} The worker identifier
 * @param tabId {string} The tab identifier on which the worker runs
 * @return {boolean}
 */
var exists = function (workerId, tabId) {
  if (typeof app.workers[tabId] != 'undefined'
    && typeof app.workers[tabId][workerId] != 'undefined') {
    return true;
  }
  return false;
};
exports.exists = exists;
