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
 * @since         5.17.0
 */
import WebauthnSetupCeremonyService from "../../service/mfa/webauthnSetupCeremonyService";
import GetActiveAccountService from "../../service/account/getActiveAccountService";
import BuildApiClientOptionsService from "../../service/account/buildApiClientOptionsService";

/**
 * Receives the ceremony result from the AppBootstrap content script. One-way message: errors are logged only.
 */
class MfaSetupHandleWebauthnCeremonyResultController {
  /**
   * @param {Worker} worker the AppBootstrap worker
   */
  constructor(worker) {
    this.worker = worker;
  }

  /**
   * Controller executor.
   * @param {object} resultDto
   * @returns {Promise<void>}
   */
  async _exec(resultDto) {
    try {
      await this.exec(resultDto);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Store the credential or drop the record and notify the App worker of the tab.
   * @param {object} resultDto
   * @returns {Promise<void>}
   */
  async exec(resultDto) {
    const account = await GetActiveAccountService.get();
    const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
    const service = new WebauthnSetupCeremonyService(apiClientOptions, account);
    await service.handleResult(this.worker.tab.id, resultDto);
  }
}

export default MfaSetupHandleWebauthnCeremonyResultController;
