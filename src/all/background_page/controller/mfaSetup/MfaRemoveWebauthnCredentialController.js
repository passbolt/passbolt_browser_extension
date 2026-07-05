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
 * @since         5.14.0
 */

import { assertString } from "../../utils/assertions";
import WebauthnApiService from "../../service/api/mfa/webauthnApiService";

class MfaRemoveWebauthnCredentialController {
  /**
   * MfaRemoveWebauthnCredentialController constructor
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
   * @param {string} credentialId The base64url credential id
   * @returns {Promise<void>}
   */
  async _exec(credentialId) {
    try {
      await this.exec(credentialId);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Remove a registered security key.
   * @param {string} credentialId The base64url credential id
   * @returns {Promise<void>}
   */
  async exec(credentialId) {
    assertString(credentialId, "The credential id should be a string.");
    await this.webauthnApiService.removeCredential(credentialId);
  }
}

export default MfaRemoveWebauthnCredentialController;
