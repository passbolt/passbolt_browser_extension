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
import { assertUuid } from "passbolt-styleguide/src/shared/utils/assertions";
import WebauthnApiService from "../../service/api/mfa/webauthnApiService";

class MfaSetupDeleteWebauthnCredentialController {
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
   * @param {string} id the credential id
   * @returns {Promise<void>}
   */
  async _exec(id) {
    try {
      await this.exec(id);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Delete a WebAuthn credential of the current user.
   * @param {string} id the credential id
   * @returns {Promise<void>}
   */
  async exec(id) {
    assertUuid(id, 'The parameter "id" should be a UUID');
    await this.webauthnApiService.delete(id);
  }
}

export default MfaSetupDeleteWebauthnCredentialController;
