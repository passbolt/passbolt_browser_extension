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
 * @since         4.2.0
 */
class Lock {
  constructor() {
    this._locked = false;
    this._queue = [];
  }

  /**
   * Acquire lock
   * Push a new promise in a queue if the lock is locked
   * @return {Promise<void>|Promise<unknown>}
   */
  acquire() {
    if (this._locked) {
      return new Promise(resolve => this._queue.push(resolve));
    } else {
      this._locked = true;
      return Promise.resolve();
    }
  }

  /**
   * Release the lock unless there is another promise in the queue
   */
  release() {
    const next = this._queue.shift();
    if (next) {
      next();
    } else {
      this._locked = false;
    }
  }
}

export default Lock;
