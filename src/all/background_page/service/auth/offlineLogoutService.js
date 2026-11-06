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

import PostLogoutService from "./postLogoutService";
import FindAndUpdateActiveSessionSessionStorageService from "../activeSession/findAndUpdateActiveSessionSessionStorageService";
import OfflineSessionExpiryAlarmService from "./offlineSessionExpiryAlarmService";

/**
 * Sign out a user authenticated offline. The API is not called.
 */
class OfflineLogoutService {
  /**
   * @constructor
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.findAndUpdateActiveSessionSessionStorageService = new FindAndUpdateActiveSessionSessionStorageService(
      account,
      apiClientOptions,
    );
  }

  /**
   * Mark the active session as signed out, clear the offline session expiry alarm and run the post-logout cleanup.
   * @return {Promise<void>}
   */
  async exec() {
    await this.findAndUpdateActiveSessionSessionStorageService.resetAuthentication();
    // clear offline alarm if any
    await OfflineSessionExpiryAlarmService.clearAlarm();
    await PostLogoutService.exec();
  }
}

export default OfflineLogoutService;
