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
import GetSessionTimestampsService from "../../service/sessionTimestamps/getSessionTimestampsService";

/**
 * Returns the session timestamps (last_logged_in, last_seen_online).
 */
class GetSessionTimestampsController {
  /**
   * @param {Worker} worker The worker
   * @param {string} requestId The request identifier
   * @param {AccountEntity} account The user account
   */
  constructor(worker, requestId, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.getSessionTimestampsService = new GetSessionTimestampsService(account);
  }

  /**
   * Wrapper of exec function to run it with worker.
   * @return {Promise<void>}
   */
  async _exec() {
    try {
      const sessionTimestampsEntity = await this.exec();
      this.worker.port.emit(this.requestId, "SUCCESS", sessionTimestampsEntity);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Get the session timestamps.
   * @return {Promise<SessionTimestampsEntity|null>} null if none are stored.
   */
  async exec() {
    return this.getSessionTimestampsService.get();
  }
}

export default GetSessionTimestampsController;
