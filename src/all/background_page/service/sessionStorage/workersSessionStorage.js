/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.0.0
 */
import browser from "../../sdk/polyfill/browserPolyfill";
import Lock from "../../utils/lock";
import WorkerEntity from "../../model/entity/worker/workerEntity";
const lock = new Lock();

const WORKERS_STORAGE_KEY = 'workers';
const LIMIT_WORKERS_BY_TAB = 100;

class WorkersSessionStorage {
  /**
   * Set the workers session storage.
   *
   * @throws {Error} if operation failed
   * @return {Promise<array>} results object, containing every object in keys that was found in the storage area.
   * If storage is not set, undefined will be returned.
   */
  async getWorkers() {
    const {workers} = await browser.storage.session.get(WORKERS_STORAGE_KEY);
    return workers || [];
  }

  /**
   * Get a worker from the session storage by id
   *
   * @param {string} id The worker id
   * @return {Promise<object>} worker dto object
   */
  getWorkerById(id) {
    const findById = workers => workers.find(worker => worker.id === id);
    return this.getWorkers().then(findById);
  }

  /**
   * Get workers from the session storage by tab id
   *
   * @param {number} tabId The tab id
   * @return {Promise<object>} worker dto object
   */
  getWorkersByTabId(tabId) {
    const filterByTabId = workers => workers.filter(worker => worker.tabId === tabId);
    return this.getWorkers().then(filterByTabId);
  }

  /**
   * Get workers from the session storage by name and tab id
   *
   * @param {string} name The name
   * @param {number} tabId The tab id
   * @return {object} worker dto object
   */
  getWorkersByNameAndTabId(name, tabId) {
    const filterByNameAndTabId = workers => workers.filter(worker => worker.name === name && worker.tabId === tabId);
    return this.getWorkers().then(filterByNameAndTabId);
  }

  /**
   * Get worker from the main frame
   * @param tabId
   * @return {Promise<object>}
   */
  async getWorkerOnMainFrame(tabId) {
    const workers = await this.getWorkersByTabId(tabId);
    return workers.find(worker => worker.frameId === 0);
  }


  /**
   * Add a worker in the session storage
   * @param {WorkerEntity} workerEntity
   * @return {Promise<void>}
   */
  async addWorker(workerEntity) {
    await lock.acquire();
    try {
      this.assertEntityBeforeSave(workerEntity);
      const workers = await this.getWorkers();
      if (!this.IsExceedNumberWorkersByTabId(workers, workerEntity.tabId)) {
        workers.push(workerEntity.toDto());
        await browser.storage.session.set({workers});
      } else {
        throw new Error(`The extension port limit is exceeded on tab ${workerEntity.tabId}`);
      }
    } finally {
      lock.release();
    }
  }

  /**
   *
   * @param {Object<array>} workers The workers
   * @param {number} tabId The tab id
   * @param {number} limit The limit
   * @constructor
   */
  IsExceedNumberWorkersByTabId(workers, tabId, limit = LIMIT_WORKERS_BY_TAB) {
    return workers.filter(worker => worker.tabId === tabId).length >= limit;
  }

  /**
   * Update a worker in the session storage.
   * @param {WorkerEntity} workerEntity The worker to update
   * @throws {Error} if the worker does not exist in the local storage
   * @return {Promise<void>}
   */
  async updateWorker(workerEntity) {
    await lock.acquire();
    try {
      this.assertEntityBeforeSave(workerEntity);
      const workers = await this.getWorkers();
      const workerIndex = workers.findIndex(item => item.id === workerEntity.id);
      if (workerIndex === -1) {
        throw new Error('The worker could not be found in the session storage');
      }
      workers[workerIndex] = workerEntity.toDto();
      await browser.storage.session.set({workers});
    } finally {
      lock.release();
    }
  }

  /**
   * Delete workers in the session storage by tab id.
   * @param {number} tabId The tab id
   * @return {Promise<void>}
   */
  async deleteByTabId(tabId) {
    await lock.acquire();
    try {
      const workers = await this.getWorkers();
      const keepWorkerNotInTabId = worker => worker.tabId !== tabId;
      const workersToKeep = workers.filter(keepWorkerNotInTabId);
      await browser.storage.session.set({workers: workersToKeep});
    } finally {
      lock.release();
    }
  }

  /**
   * Delete workers in the session storage by port id.
   * @param {string} id The worker id
   * @return {Promise<void>}
   */
  async deleteById(id) {
    await lock.acquire();
    try {
      const workers = await this.getWorkers();
      const keepWorkerNotInTabId = worker => worker.id !== id;
      const workersToKeep = workers.filter(keepWorkerNotInTabId);
      await browser.storage.session.set({workers: workersToKeep});
    } finally {
      lock.release();
    }
  }

  /**
   * Flush the session storage.
   * @return {Promise<void>}
   */
  async flush() {
    const workers = [];
    await lock.acquire();
    try {
      await browser.storage.session.set({workers});
    } finally {
      lock.release();
    }
  }

  /**
   * Make sure the entity meet some minimal requirements before being stored
   *
   * @param {WorkerEntity} workerEntity
   * @throw {TypeError} if requirements are not met
   * @private
   */
  assertEntityBeforeSave(workerEntity) {
    if (!workerEntity) {
      throw new TypeError('WorkerSessionStorage expects a WorkerEntity to be set');
    }
    if (!(workerEntity instanceof WorkerEntity)) {
      throw new TypeError('WorkerSessionStorage expects an object of type WorkerEntity');
    }
  }
}

export default new WorkersSessionStorage();
