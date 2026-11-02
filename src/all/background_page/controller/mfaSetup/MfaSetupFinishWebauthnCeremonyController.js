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

class MfaSetupFinishWebauthnCeremonyController {
  /**
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions
   * @param {AccountEntity} account
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.webauthnSetupCeremonyService = new WebauthnSetupCeremonyService(apiClientOptions, account);
  }

  /**
   * Controller executor.
   * @param {string} name the credential name
   * @returns {Promise<void>}
   */
  async _exec(name) {
    try {
      const result = await this.exec(name);
      this.worker.port.emit(this.requestId, "SUCCESS", result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Finish the WebAuthn setup ceremony with the credential name.
   * @param {string} name the credential name
   * @returns {Promise<{verified: boolean}>}
   */
  async exec(name) {
    return this.webauthnSetupCeremonyService.finish(this.worker.tab.id, name);
  }
}

export default MfaSetupFinishWebauthnCeremonyController;
