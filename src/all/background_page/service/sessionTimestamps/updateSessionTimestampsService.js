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
import GetSessionTimestampsService from "./getSessionTimestampsService";
import { assertType } from "../../utils/assertions";

const UPDATE_SESSION_TIMESTAMPS_LS_LOCK_PREFIX = "UPDATE_SESSION_TIMESTAMPS_LS_LOCK-";

/**
 * Update the session timestamps (last_logged_in, last_seen_online) in the local storage.
 */
class UpdateSessionTimestampsService {
  /**
   * @param {AccountEntity} account The user account
   */
  constructor(account) {
    this.account = account;
    this.sessionTimestampsLocalStorage = new SessionTimestampsLocalStorage(account);
    this.getSessionTimestampsService = new GetSessionTimestampsService(account);
  }

  /**
   * Online sign-in: the user logged in and the server was seen at the same time.
   * @param {Date} [date] The sign-in date, now by default.
   * @returns {Promise<void>}
   */
  async updateOnOnlineLogin(date = new Date()) {
    assertType(date, Date);
    await navigator.locks.request(`${UPDATE_SESSION_TIMESTAMPS_LS_LOCK_PREFIX}${this.account.id}`, async () => {
      const sessionTimestampsEntity = new SessionTimestampsEntity({
        last_logged_in: date.toISOString(),
        last_seen_online: date.toISOString(),
      });
      await this.sessionTimestampsLocalStorage.setData(sessionTimestampsEntity);
    });
  }

  /**
   * Offline sign-in: the user logged in, the server was not seen.
   * Does nothing if no session timestamps are stored: without a last seen online date the offline sign-in is refused.
   * @param {Date} [date] The sign-in date, now by default.
   * @returns {Promise<void>}
   */
  async updateOnOfflineLogin(date = new Date()) {
    assertType(date, Date);
    await this._update((sessionTimestampsEntity) => {
      sessionTimestampsEntity.lastLoggedIn = date.toISOString();
    });
  }

  /**
   * The server was seen while the user is signed in online.
   * Caller is AuthSessionCheck alarm (StartLoopAuthSessionCheckService) every minute until online sign in to logout
   * Does nothing if no session timestamps are stored: they are created at the online sign-in.
   * @param {Date} date The date the server was seen.
   * @returns {Promise<void>}
   */
  async updateLastSeenOnline(date) {
    assertType(date, Date);
    await this._update((sessionTimestampsEntity) => {
      sessionTimestampsEntity.lastSeenOnline = date.toISOString();
    });
  }

  /**
   * Read, update and write the stored session timestamps under a lock. Does nothing if none are stored.
   * @param {function(SessionTimestampsEntity): void} updater Updates the entity in place.
   * @returns {Promise<void>}
   * @private
   */
  async _update(updater) {
    await navigator.locks.request(`${UPDATE_SESSION_TIMESTAMPS_LS_LOCK_PREFIX}${this.account.id}`, async () => {
      const sessionTimestampsEntity = await this.getSessionTimestampsService.get();
      /*
       * Only the online sign-in (updateOnOnlineLogin) creates the session timestamps, so a missing record is not recreated here.
       * TODO: migration of the dates from former active session records when active session will no longer have these timestamps.
       * Behavior change compared to these timestamps in activesession: In the active session (local storage, active_session-<accountId>), a
       * missing record is recreated: updateLastSeenOnline builds a default active session (with a server status call)
       * and authenticateOffline writes one with last_logged_in only.
       */
      if (!sessionTimestampsEntity) {
        return;
      }
      updater(sessionTimestampsEntity);
      await this.sessionTimestampsLocalStorage.setData(sessionTimestampsEntity);
    });
  }
}

export default UpdateSessionTimestampsService;
