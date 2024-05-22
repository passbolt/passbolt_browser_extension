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
 * @since         4.9.0
 *
 * On start up extension
 */
import storage from "../../sdk/storage";
import {Config} from "../../model/config";
import LocalStorageService from "../localStorage/localStorageService";
import {BrowserExtensionIconService} from "../ui/browserExtensionIcon.service";
import User from "../../model/user";

class OnStartUpService {
  /**
   * Execute the OnExtensionUpdateAvailableService process
   * @returns {Promise<void>}
   */
  static async exec() {
    // Check if the storage have some data
    if (Object.keys(storage._data).length === 0) {
      // Fix the initialization of the storage after an update
      await storage.init();
      // Initialization of the config to get the user information
      Config.init();
    }
    // Flush the local storage
    LocalStorageService.flush();
    const user = User.getInstance();
    // Check if user is valid
    if (!user.isValid()) {
      return;
    }
    // Update the toolbar icon
    BrowserExtensionIconService.deactivate();
  }
}

export default OnStartUpService;
