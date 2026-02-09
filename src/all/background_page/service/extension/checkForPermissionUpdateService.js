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
 * @since         5.10.0
 */

/**
 * @type {Worker|null}
 */
let _worker = null;

/**
 * @type {Function|null}
 */
let _boundHandler = null;

export default class CheckForPermissionUpdateService {
  /**
   * Starts listening for permission additions.
   * @param {Worker} worker The associated worker.
   * @returns {void}
   */
  static start(worker) {
    _worker = worker;
    _boundHandler = CheckForPermissionUpdateService._onPermissionAdded;
    browser.permissions.onAdded.addListener(_boundHandler);
  }

  /**
   * Stops listening for permission additions.
   * @returns {void}
   */
  static stop() {
    if (_boundHandler) {
      browser.permissions.onAdded.removeListener(_boundHandler);
      _boundHandler = null;
      _worker = null;
    }
  }

  /**
   * Handler called when a permission is added.
   * @param {object} permissions The permissions that were added.
   * @returns {void}
   * @private
   */
  static _onPermissionAdded(permissions) {
    _worker.port.request("passbolt.extension.on-permission-updated", permissions);
  }
}
