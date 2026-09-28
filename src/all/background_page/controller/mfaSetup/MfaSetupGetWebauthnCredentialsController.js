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
import WebauthnApiService from "../../service/api/mfa/webauthnApiService";
import MfaWebauthnCredentialsCollection from "../../model/entity/mfa/mfaWebauthnCredentialsCollection";

class MfaSetupGetWebauthnCredentialsController {
  /**
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.webauthnApiService = new WebauthnApiService(apiClientOptions);
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
   * Get the WebAuthn credentials of the current user.
   * @returns {Promise<Array<object>>}
   */
  async exec() {
    const response = await this.webauthnApiService.findAll();
    const collection = new MfaWebauthnCredentialsCollection(response.body);
    return collection.toDto();
  }
}

export default MfaSetupGetWebauthnCredentialsController;
