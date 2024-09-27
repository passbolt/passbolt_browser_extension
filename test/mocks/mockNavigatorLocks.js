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
 * @since         4.1.0
 */

/**
 * Mock class to be used in replacement of navigator.locks
 */
class MockNavigatorLocks {
  locks = {};

  /**
   * @inheritDoc navigator.lock.request
   * @see https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request
   */
  async request(name, options, callback) {
    if (typeof options !== "object") {
      callback = options;
      options = null;
    }

    // A lock already held.
    if (options?.ifAvailable && this.locks[name]?.length) {
      return callback(false);
    }

    let lock = {};
    const promise = new Promise((resolve, reject) => {
      lock = {name, resolve, reject, callback};
    });

    if (!this.locks[name]) {
      this.locks[name] = [];
    }
    this.locks[name].push(lock);

    // If only one lock request, execute its callback.
    if (this.locks[name].length === 1) {
      this.executeLockCallback(lock);
    }

    return promise;
  }

  async executeLockCallback(lock) {
    try {
      const result = await lock.callback(true);
      this.locks[lock.name].shift();
      lock.resolve(result);
    } catch (error) {
      this.locks[lock.name].shift();
      lock.reject(error);
    } finally {
      if (this.locks[lock.name]?.length) {
        this.executeLockCallback(this.locks[lock.name][0]);
      }
    }
  }
}

export default MockNavigatorLocks;
