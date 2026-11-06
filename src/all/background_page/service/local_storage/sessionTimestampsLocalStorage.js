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
import SessionTimestampsEntity from "passbolt-styleguide/src/shared/models/entity/sessionTimestamps/sessionTimestampsEntity";
import AbstractLocalStorage from "./abstractLocalStorage";

export const SESSION_TIMESTAMPS_LOCAL_STORAGE_KEY = "session_timestamps";

/**
 * The session timestamps (last_logged_in, last_seen_online).
 */
class SessionTimestampsLocalStorage extends AbstractLocalStorage {
  /**
   * Get the key property
   * @return {string}
   */
  get key() {
    return SESSION_TIMESTAMPS_LOCAL_STORAGE_KEY;
  }

  /**
   * Get the entity class
   * @return {SessionTimestampsEntity}
   */
  get entityClass() {
    return SessionTimestampsEntity;
  }
}

export default SessionTimestampsLocalStorage;
