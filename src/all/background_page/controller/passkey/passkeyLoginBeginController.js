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
import PasskeyDataStorage from "../../service/indexedDB_storage/passkeyDataStorage";

/**
 * Starts a passwordless login: returns the request options (challenge, allowCredentials) and a
 * challenge token for the account this browser profile is set up for. The WebAuthn call itself runs
 * next in the injected content script (the styleguide), which then submits the assertion to the login
 * controller. Fails fast if no passkey kit is stored locally.
 */
class PasskeyLoginBeginController {
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
   * @returns {Promise<Object>} {token, credentialRequestOptions}
   */
  async exec() {
    if (!(await PasskeyDataStorage.hasAny())) {
      throw new Error("No passwordless kit is registered on this browser profile.");
    }

    return this.passkeyApiService.beginLogin(this.account.userId);
  }
}

export default PasskeyLoginBeginController;
