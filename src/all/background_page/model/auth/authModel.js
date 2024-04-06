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
 */
import AuthLogoutService from 'passbolt-styleguide/src/shared/services/api/auth/AuthLogoutService';
import AuthStatusLocalStorage from "../../service/local_storage/authStatusLocalStorage";
import PostLogoutService from '../../service/auth/postLogoutService';

class AuthModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.authLogoutService = new AuthLogoutService(apiClientOptions);
  }

  /**
   * Logout
   * @returns {Promise<void>}
   */
  async logout() {
    await this.authLogoutService.logout();
    await this.postLogout();
  }

  /**
   * Post logout
   * @returns {Promise<void>}
   */
  async postLogout() {
    const isAuthenticated = false;
    const isMfaRequired = false;
    await AuthStatusLocalStorage.set(isAuthenticated, isMfaRequired);
    await PostLogoutService.exec();
  }
}

export default AuthModel;
