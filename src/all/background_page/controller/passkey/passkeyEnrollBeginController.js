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
import PasskeyApiService from "../../service/api/passkey/passkeyApiService";

/**
 * Starts a passwordless enrollment (authenticated): returns the creation options (challenge,
 * excludeCredentials) and a challenge token. The WebAuthn call runs next in the injected content
 * script (the settings UI), which then submits the attestation to the enroll controller.
 */
class PasskeyEnrollBeginController {
  /**
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions
   * @param {AccountEntity} account The user account
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.account = account;
    this.passkeyApiService = new PasskeyApiService(apiClientOptions);
  }

  /**
   * Wrapper of exec that emits the options on the worker port.
   *
   * @returns {Promise<void>}
   */
  async _exec() {
    try {
      const options = await this.exec();
      this.worker.port.emit(this.requestId, "SUCCESS", options);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * @returns {Promise<Object>} {token, credentialCreationOptions}
   */
  async exec() {
    return this.passkeyApiService.beginSetup();
  }
}

export default PasskeyEnrollBeginController;
