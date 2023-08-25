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
  /**
   * Mock lock request.
   * @param {string} lockName The lock name
   * @param {function} callback The function callback
   * @returns {Promise<*>}
   */
  async request(lockName, callback) {
    return callback();
  }
}

export default MockNavigatorLocks;
