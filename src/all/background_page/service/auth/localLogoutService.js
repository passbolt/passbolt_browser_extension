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
 * @since         5.18.0
 */

import SessionCookieFlushService from "./sessionCookieFlushService";
import OfflineLogoutService from "./offlineLogoutService";

/**
 * Sign out a user authenticated online when the API is unavailable. The API is not called.
 */
class LocalLogoutService {
  /**
   * @constructor
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.sessionCookieFlushService = new SessionCookieFlushService(account);
    this.offlineLogoutService = new OfflineLogoutService(account, apiClientOptions);
  }

  /**
   * Remove the session cookies, then sign the user out as an offline logout does.
   * @return {Promise<void>}
   */
  async exec() {
    await this.sessionCookieFlushService.flush();
    await this.offlineLogoutService.exec();
  }
}

export default LocalLogoutService;
