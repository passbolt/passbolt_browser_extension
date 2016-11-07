/**
 * The aim of the worker model is to manage instantiated workers.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var app = require('../app');

/**
 * Reference a worker.
 * @param workerId {string} The worker identifier
 * @param worker {Worker} The worker to reference
 * @param options {array} Optional data
 */
var add = function (workerId, worker, options) {
  options = options || {};
  var url = worker.tab.url;

  if (exists(workerId, worker.tab.id)) {
    // if a worker with same id is already in the tab
    // // destroy it, it will trigger a detach event (see bellow)
    app.workers[worker.tab.id][workerId].destroy('destroying worker because it already exist');
  }
  
  // Add the worker to the list of active app workers.
  // Build the workers list for that tab if needed
  console.debug('Add worker @ id:' + workerId + ', tab:' + worker.tab.id + ', url:' + worker.tab.url);
  if (typeof app.workers[worker.tab.id] === 'undefined') {
    app.workers[worker.tab.id] = {};
  }
  app.workers[worker.tab.id][workerId] = worker;

  // Listen to tab url changes.
  // If callback given in option on url change, call it
  // var onTabReadyHandler = function (tab) {
  //   if (url != tab.url.split('#')[0]) {
  //     // console.log('url changed on tabReadyHandler');
  //     if (options.onTabUrlChange) {
  //       options.onTabUrlChange(worker);
  //     }
  //     worker.tab.removeListener('ready', onTabReadyHandler);
  //   }
  // };
  // worker.tab.on('ready', onTabReadyHandler);

  // Listen to worker detach event
  // This event is called as part of the worker destroy
  // Remove the worker from the list
  var onWorkerDetachHandler = function () {
    remove(workerId, worker.tab.id, options);
  };
  worker.on('detach', onWorkerDetachHandler);

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
    console.warn('Warning: unable to remove the worker ' + workerId + ', it doesn\'t exist on the tab ' + tabId + ' .');
  } else {
    console.debug('Remove worker @ id:' + workerId + ', tab:' + tabId);
    if (typeof options.onDestroy !== 'undefined') {
      options.onDestroy();
    }
    delete app.workers[tabId][workerId];
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
  // if tab does not exist
  if (typeof app.workers[tabId] === 'undefined') {
    return false;
  }
  if (typeof app.workers[tabId][workerId] === 'undefined') {
    return false;
  }
  return true;
};
exports.exists = exists;
