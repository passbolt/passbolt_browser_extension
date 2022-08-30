/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2021 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2021 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         1.3.0
 */
import Log from "./log";
import browser from "../sdk/polyfill/browserPolyfill";
const workers = {};

const WORKER_EXIST_FLUSH_ALARM = "WorkerExistFlush";

/**
 * Reference a worker.
 * @param workerId {string} The worker identifier
 * @param worker {Worker} The worker to reference
 */
const add = function(workerId, worker) {
  const tabId = worker?.tab?.id || -1;
  if (exists(workerId, tabId)) {
    /*
     * if a worker with same id is already in the tab
     * destroy it, it will trigger a detach event (see bellow)
     * @todo Overall this workers catalog management should be brought at a lower level, and constraint of uniqueness
     *   of a worker should be expressed by a pagemod property.
     */
    workers[tabId][workerId].destroy(`from model/worker::add because ${workerId} already exist at tab ${tabId}`);
  }

  /*
   * Add the worker to the list of active app workers.
   * Build the workers list for that tab if needed
   */
  Log.write({
    level: 'debug',
    message: `model/worker:: Add worker ${workerId}, tab:${tabId}, url:${worker?.tab?.url}`
  });

  workers[tabId] = workers[tabId] || {};
  workers[tabId][workerId] = worker;

  /*
   * Listen to worker detach event
   * This event is called as part of the worker destroy
   * Remove the worker from the list
   */
  const onWorkerDetachHandler = () => remove(workerId, tabId);
  worker.on('detach', onWorkerDetachHandler);
};

/**
 * Remove a worker from the list of referenced workers.
 * @param workerId {string} The worker identifier.
 * @param tabId {string} The tab identifier on which the worker runs.
 */
const remove = function(workerId, tabId) {
  if (!exists(workerId, tabId)) {
    Log.write({
      level: 'warning',
      'message': `model/worker::remove unable to remove ${workerId}, it does not exist for tab ${tabId}`
    });
  } else {
    Log.write({level: 'debug', message: `model/worker::remove ${workerId}, tab:${tabId}`});
    delete workers[tabId][workerId];
  }
};

/**
 * Get a worker.
 * @param workerId {string} The worker identifier
 * @param {string} tabId The tab identifier on which the worker runs
 * @param {?boolean} log error optional, default true
 * @return {Worker} null if the worker doesn't exist.
 */
const get = function(workerId, tabId, log = true) {
  if (!exists(workerId, tabId)) {
    const error = new Error(`Could not find worker ID ${workerId} for tab ${tabId}.`);
    if (log) {
      console.error(error, workers);
    }
    throw error;
  }
  return workers[tabId][workerId];
};

/**
 * Checks that a worker exists.
 * @param {string} workerId The worker identifier
 * @param {string} tabId The tab identifier on which the worker runs
 * @return {boolean}
 */
const exists = function(workerId, tabId) {
  return !(!workers[tabId] || !workers[tabId][workerId]);
};

/**
 * Wait until a worker exists
 * @param {string} workerId The worker identifier
 * @param {string} tabId The tab identifier on which the worker runs
 * @param {int} timeout The timeout after which the promise fails if the worker is not found
 * @return {Promise<void>}
 */
const waitExists = function(workerId, tabId, timeout = 10000) {
  const timeoutMs = Date.now() + timeout;
  return new Promise((resolve, reject) => {
    const handleFlushEvent = alarm =>  {
      if (alarm.name === WORKER_EXIST_FLUSH_ALARM) {
        try {
          clearAlarm(handleFlushEvent);
          get(workerId, tabId, false);
          resolve();
        } catch (error) {
          if (alarm.scheduledTime >= timeoutMs) {
            reject(error);
          } else {
            createAlarm(handleFlushEvent);
          }
        }
      }
    };
    createAlarm(handleFlushEvent);
  });
};

/**
 * Create alarm to flush the resource
 * @private
 * @param {function} handleFlushEvent The function on alarm listener
 */
const createAlarm = function(handleFlushEvent) {
  // Create an alarm to check if the worker exist
  browser.alarms.create(WORKER_EXIST_FLUSH_ALARM, {
    when: Date.now() + 100
  });
  browser.alarms.onAlarm.addListener(handleFlushEvent);
};

/**
 * Clear the alarm and listener configured for flushing the resource if any.
 * @private
 * @param {function} handleFlushEvent The function on alarm listener
 */
const clearAlarm = function(handleFlushEvent) {
  browser.alarms.onAlarm.removeListener(handleFlushEvent);
  browser.alarms.clear(WORKER_EXIST_FLUSH_ALARM);
};

export const Worker = {waitExists, exists, get, add};
