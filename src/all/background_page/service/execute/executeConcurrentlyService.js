/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since        4.9.4
 */

import {assertArray, assertNumber} from "../../utils/assertions";
import {v4 as uuidv4} from "uuid";

/**
 * Execute concurrently service
 */
class ExecuteConcurrentlyService {
  /**
   * Constructor
   */
  constructor() {
    this.nextCallbackIndex = 0;
    this.lockKey = uuidv4();
    this.hasError = false;
  }

  /**
   * Execute callback promises in parallel
   *
   * @param {array<function>} callbacks The callbacks
   * @param {number} concurrency The concurrency
   * @param {object} options The options
   * @param {Object} [options.ignoreError=false] Throw error and stop the execution.
   * @return {Promise<Array>} The results following the callbacks array order
   */
  async execute(callbacks, concurrency, options = {ignoreError: false}) {
    // Don't allow to execute the service twice
    if (this.nextCallbackIndex !== 0) {
      throw new Error("ExecuteConcurrentlyService should be executed only once");
    }
    assertArray(callbacks);
    assertNumber(concurrency);
    const ignoreError = options?.ignoreError ?? false;
    // store the results
    const results = {};

    return new Promise((resolve, reject) => {
      for (let index = 0; index < concurrency; index++) {
        this.executeCallbacksUntilComplete(callbacks, results, ignoreError, resolve, reject);
      }
    });
  }

  /**
   * Get the next callback index
   * @returns {Promise<number>} The callback index
   * @private
   */
  getAndIncrementCallbackIndex() {
    return navigator.locks.request(this.lockKey, () => this.nextCallbackIndex++);
  }

  /**
   * Execute callbacks until complete
   * @param {array<function>} callbacks The callbacks
   * @param {object} results The results
   * @param {boolean} ignoreError The ignore error property
   * @param {function} resolve The resolve promise
   * @param {function} reject The reject promise
   * @returns {Promise<Array>}
   * @throw {Error} throw an error if ignoreError is true else store in the results.
   * @private
   */
  async executeCallbacksUntilComplete(callbacks, results, ignoreError, resolve, reject) {
    let index = await this.getAndIncrementCallbackIndex();
    while (index < callbacks.length && !this.hasError) {
      try {
        // store the output of the task
        results[index] = await callbacks[index]();
      } catch (error) {
        if (!ignoreError) {
          // IMPORTANT: To stop the loop and other promises
          this.hasError = true;
          reject(error);
          break;
        }
        // store the error of the task and continue
        results[index] = error;
      }
      // when complete resolve the promise
      if (Object.keys(results).length === callbacks.length) {
        // When using numeric keys, the values are returned in the keys' numerical order
        resolve(Object.values(results));
        break;
      }
      // increment the index to continue to loop on a new callback
      index = await this.getAndIncrementCallbackIndex();
    }
  }
}

export default ExecuteConcurrentlyService;
