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
 * @since         4.1.2
 */
const PROMISE_TIMEOUT = 500;
class PromiseTimeoutService {
  /**
   * Resolve promise with timeout
   * @param promise The promise
   * @param {number} timeout The timeout
   * @return {Promise<unknown>}
   */
  static exec(promise, timeout = PROMISE_TIMEOUT) {
    return new Promise((resolve, reject) => {
      // Schedule promise timeout
      const timeoutId = setTimeout(reject, timeout);
      // Clear promise timeout alarm
      const clearTimeoutWithId = () => clearTimeout(timeoutId);
      // return the promise resolved else reject and finally clear timeout
      promise.then(resolve).catch(reject).finally(clearTimeoutWithId);
    });
  }
}

export default PromiseTimeoutService;

