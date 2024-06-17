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
 * @since         4.7.0
 */

import MfaAuthenticationRequiredError from "../../error/mfaAuthenticationRequiredError";
import AuthenticationStatusService from "../authenticationStatusService";
import AuthStatusLocalStorage from "../local_storage/authStatusLocalStorage";

class CheckAuthStatusService {
  /**
   * Returns the authentication status of the current user.
   * It first interrogates the local storage and if necessary the API afterward.
   * @param {boolean} [flushCache] should the cache be flushed before or not.
   * @return {Promise<{isAuthenticated: {boolean}, isMfaRequired: {boolean}}>}
   * @throws {Error} if something wrong happened on the API
   */
  async checkAuthStatus(flushCache = false) {
    if (!flushCache) {
      const storedStatus = await AuthStatusLocalStorage.get();
      if (storedStatus) {
        return storedStatus;
      }
    }

    let isAuthenticated, isMfaRequired;
    try {
      isAuthenticated = await AuthenticationStatusService.isAuthenticated();
      isMfaRequired = false;
    } catch (error) {
      if (!(error instanceof MfaAuthenticationRequiredError)) {
        throw error;
      }
      isAuthenticated = true;
      isMfaRequired = true;
    }

    await AuthStatusLocalStorage.set(isAuthenticated, isMfaRequired);
    return {isAuthenticated, isMfaRequired};
  }
}

export default CheckAuthStatusService;
