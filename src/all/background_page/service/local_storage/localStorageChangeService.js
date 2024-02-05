/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.6.0
 */

import LocalStorageChangeEvent from "../../utils/localStorageChangeEvent";

export default class LocalStorageChangeService {
  /**
   * Triggers a DOM event to signal when the local storage changed.
   * It also sends the changed data as the native local storage change event would.
   * This is mainly use for browsers that doesn't callback a local storage change listener
   * when the listener is set from an iframe (like for Safari).
   * @param {string} localStorageKey the local storage key where the change occured
   * @param {any} changedData the data that has been changed on the storage.
   */
  static triggerLocalStorageChangeEvent(localStorageKey, changedData) {
    const event = new LocalStorageChangeEvent(localStorageKey, changedData);
    self.dispatchEvent(event);
  }
}
