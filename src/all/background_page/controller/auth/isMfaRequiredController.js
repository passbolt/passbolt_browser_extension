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
 * @since         2.11.0
 */
import FindAndUpdateActiveSessionSessionStorageService from "../../service/activeSession/findAndUpdateActiveSessionSessionStorageService";

class IsMfaRequiredController {
  /**
   * FindAndUpdateActiveSessionSessionStorageController Constructor
   *
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions
   * @param {AccountEntity} account
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.findAndUpdateActiveSessionSessionStorageService = new FindAndUpdateActiveSessionSessionStorageService(
      account,
      apiClientOptions,
    );
  }

  /**
   * Execute the controller.
   */
  async _exec() {
    try {
      const isMfaRequired = await this.exec();
      this.worker.port.emit(this.requestId, "SUCCESS", isMfaRequired);
    } catch (error) {
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Returns user active session
   * @returns {Promise<boolean>}
   */
  async exec() {
    const activeSession =
      await this.findAndUpdateActiveSessionSessionStorageService.findAndUpdateAuthenticationStatus();
    return activeSession.isMfaRequired;
  }
}

export default IsMfaRequiredController;
