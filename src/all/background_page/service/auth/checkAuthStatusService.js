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
import ActiveSessionLocalStorage from "../local_storage/activeSessionLocalStorage";
import OnlineSessionEntity from "passbolt-styleguide/src/shared/models/entity/session/onlineSessionEntity";

class CheckAuthStatusService {
  /**
   * Constructor
   *
   * @param {AccountEntity} account the user account
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.authenticationStatusService = new AuthenticationStatusService(apiClientOptions);
    this.activeSessionLocalStorage = new ActiveSessionLocalStorage(account);
  }

  /**
   * Returns the authentication status of the current user.
   * It first interrogates the local storage and if necessary the API afterward.
   * @param {boolean} [flushCache] should the cache be flushed before or not.
   * @return {Promise<OnlineSessionEntity>}
   * @throws {Error} if something wrong happened on the API
   */
  async checkAuthStatus(flushCache = false) {
    const storedSession = await this.activeSessionLocalStorage.get();
    if (!flushCache && storedSession) {
      return new OnlineSessionEntity(storedSession);
    }

    const session = { ...storedSession };
    try {
      session.is_authenticated = await this.authenticationStatusService.isAuthenticated();
      session.is_mfa_authenticated = true;
    } catch (error) {
      if (!(error instanceof MfaAuthenticationRequiredError)) {
        throw error;
      }
      session.is_authenticated = true;
      session.is_mfa_authenticated = false;
    }

    const onlineSessionEntity = new OnlineSessionEntity(session);
    await this.activeSessionLocalStorage.set(onlineSessionEntity);
    return onlineSessionEntity;
  }
}

export default CheckAuthStatusService;
