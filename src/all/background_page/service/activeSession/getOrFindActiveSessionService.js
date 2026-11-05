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
import ActiveSessionSessionStorage from "../session_storage/activeSessionSessionStorage";
import UserActiveSessionEntity from "passbolt-styleguide/src/shared/models/entity/session/userActiveSessionEntity";
import FindAndUpdateActiveSessionSessionStorageService from "./findAndUpdateActiveSessionSessionStorageService";

/**
 * The service aims to find a user active session.
 */
export default class GetOrFindActiveSessionService {
  /**
   * @constructor
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.activeSessionSessionStorage = new ActiveSessionSessionStorage(account);
    this.findAndUpdateActiveSessionSessionStorageService = new FindAndUpdateActiveSessionSessionStorageService(
      account,
      apiClientOptions,
    );
  }

  /**
   * Find the user active session
   * If no session, call the find and update active session local storage service
   * @returns {Promise<UserActiveSessionEntity>}
   */
  async getOrFind() {
    const hasRuntimeCache = this.activeSessionSessionStorage.hasCachedData();
    const userActiveSessionDto = await this.activeSessionSessionStorage.get();
    // Return local storage data if the storage was initialized.
    if (userActiveSessionDto) {
      try {
        // No validation if data were in runtime cache, they were validate by the one which set it.
        return new UserActiveSessionEntity(userActiveSessionDto, { validate: !hasRuntimeCache });
      } catch (error) {
        console.error(error);
        // If any validation error, retrieve or create a default user active session and update the local storage.
        return await this.findAndUpdateActiveSessionSessionStorageService.findAndUpdateAuthenticationStatus();
      }
    }

    // Otherwise retrieve the user active session and update the local storage.
    return await this.findAndUpdateActiveSessionSessionStorageService.findAndUpdateAuthenticationStatus();
  }
}
