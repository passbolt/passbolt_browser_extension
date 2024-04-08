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
import AuthenticationStatusService from "../../service/authenticationStatusService";
import MfaAuthenticationRequiredError from "../../error/mfaAuthenticationRequiredError";
import WebIntegrationPagemod from "../../pagemod/webIntegrationPagemod";
import WorkerService from "../../service/worker/workerService";
import PublicWebsiteSignInPagemod from "../../pagemod/publicWebsiteSignInPagemod";

class OnExtensionUpdateAvailableController {
  /**
   * Execute the OnExtensionUpdateAvailableController process
   * @returns {Promise<void>}
   */
  static async exec() {
    if (await isUserAuthenticated()) {
      // Add listener on passbolt logout to update the extension
      self.addEventListener("passbolt.auth.after-logout", this.cleanAndReload);
    } else {
      await this.cleanAndReload();
    }
  }

  /**
   * Clean and reload the new extension
   * @return {Promise<void>}
   */
  static async cleanAndReload() {
    await WorkerService.destroyWorkersByName([WebIntegrationPagemod.appName, PublicWebsiteSignInPagemod.appName]);
    browser.runtime.reload();
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
    try {
      const isAuth = await AuthenticationStatusService.isAuthenticated();
      return isAuth;
    } catch (error) {
      if (error instanceof MfaAuthenticationRequiredError) {
        /*
         * The browser shouldn't update the current extension when the user is logged in.
         * The main reason is to avoid a bug where the passphrase is registered in memory and then forgotten as the updates provokes a memory clean
         * This would be problematic for users not knowing/remembering their passphrase and using SSO to sign in
         */
        return true;
      }
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
