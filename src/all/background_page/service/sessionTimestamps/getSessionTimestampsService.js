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
import SessionTimestampsLocalStorage from "../local_storage/sessionTimestampsLocalStorage";
import SessionTimestampsEntity from "passbolt-styleguide/src/shared/models/entity/sessionTimestamps/sessionTimestampsEntity";

/**
 * Get the session timestamps (last_logged_in, last_seen_online).
 */
class GetSessionTimestampsService {
  /**
   * @param {AccountEntity} account The user account
   */
  constructor(account) {
    this.sessionTimestampsLocalStorage = new SessionTimestampsLocalStorage(account);
  }

  /**
   * Retrieve the session timestamps from the local storage.
   * @returns {Promise<SessionTimestampsEntity|null>} null if none are stored.
   */
  async get() {
    const sessionTimestampsDto = await this.sessionTimestampsLocalStorage.getData();
    if (!sessionTimestampsDto) {
      return null;
    }

    try {
      return new SessionTimestampsEntity(sessionTimestampsDto);
    } catch (error) {
      // Catch invalid timestamps and treat as missing; next online sign in overrides them
      console.error(error);
      return null;
    }
  }
}

export default GetSessionTimestampsService;
