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
 * @since         4.6.0
 *
 * On extension update available controller
 */
import User from "../../model/user";
import GpgAuth from "../../model/gpgauth";

class OnExtensionUpdateAvailableController {
  /**
   * Execute the OnExtensionUpdateAvailableController process
   * @returns {Promise<void>}
   */
  static async exec() {
    if (await isUserAuthenticated()) {
      // Add listener on passbolt logout to update the extension
      self.addEventListener("passbolt.auth.after-logout", () => browser.runtime.reload());
    } else {
      browser.runtime.reload();
    }
  }
}

/**
 * Check and process event if the user is authenticated
 * @return {Promise<bool>}
 */
const isUserAuthenticated = async() => {
  const user = User.getInstance();
  // Check if user is valid
  if (user.isValid()) {
    const auth = new GpgAuth();
    try {
      return await auth.isAuthenticated();
    } catch (error) {
      /*
       * Service unavailable
       */
      console.debug('The Service is unavailable to check if the user is authenticated');
      console.error(error);
    }
  }
  return false;
};

export default OnExtensionUpdateAvailableController;
