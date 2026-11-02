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
import WebauthnSettingsApiService from "../../service/api/mfa/webauthnSettingsApiService";
import MfaWebauthnSettingsEntity from "../../model/entity/mfa/mfaWebauthnSettingsEntity";

class MfaSetupGetWebauthnSettingsController {
  /**
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.webauthnSettingsApiService = new WebauthnSettingsApiService(apiClientOptions);
  }

  /**
   * Controller executor.
   * @returns {Promise<void>}
   */
  async _exec() {
    try {
      const result = await this.exec();
      this.worker.port.emit(this.requestId, "SUCCESS", result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Get the organisation WebAuthn settings.
   * @returns {Promise<MfaWebauthnSettingsEntity>}
   */
  async exec() {
    const response = await this.webauthnSettingsApiService.find();
    return new MfaWebauthnSettingsEntity(response.body);
  }
}

export default MfaSetupGetWebauthnSettingsController;
