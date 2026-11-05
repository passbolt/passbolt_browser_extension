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
 * @since         6.0.0
 */
import toolbarService from "../toolbar/toolbarService";
import PostLoginService from "./postLoginService";
import OfflineSessionExpiryAlarmService from "./offlineSessionExpiryAlarmService";
import FindAndUpdateActiveSessionSessionStorageService from "../activeSession/findAndUpdateActiveSessionSessionStorageService";
import PassphraseStorageService from "../../service/session_storage/passphraseStorageService";
import FindAndUpdateMetadataKeysSessionStorageFromOPFSService from "../metadata/findAndUpdateMetadataKeysSessionStorageFromOPFSService";

/**
 * Offline counterpart of PostLoginService.exec().
 */
class PostLoginOfflineService {
  /**
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.findAndUpdateActiveSessionSessionStorageService = new FindAndUpdateActiveSessionSessionStorageService(
      account,
      apiClientOptions,
    );
    this.findAndUpdateMetadataKeysSessionStorageFromOPFSService =
      new FindAndUpdateMetadataKeysSessionStorageFromOPFSService(account);
  }

  /**
   * Offline post login.
   * @param {string} passphrase The passphrase to store for the session
   * @param {number} sessionDuration The chosen session duration in seconds
   * @returns {Promise<void>}
   */
  async exec(passphrase, sessionDuration) {
    await PassphraseStorageService.set(passphrase, sessionDuration);
    await this.findAndUpdateActiveSessionSessionStorageService.authenticateOffline();
    await this.findAndUpdateMetadataKeysSessionStorageFromOPFSService.findAndUpdateAll();
    await OfflineSessionExpiryAlarmService.scheduleSessionExpiry(this.account, sessionDuration);
    // Safe subset shared with the online flow (no server dependency).
    await PostLoginService.sendLoginEventForWorkers();
    toolbarService.handleUserLoggedIn();
  }
}

export default PostLoginOfflineService;
