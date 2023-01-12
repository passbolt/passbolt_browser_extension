/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.6.0
 */
import browser from "../../sdk/polyfill/browserPolyfill";
import AuthModel from "../../model/auth/authModel";
import CheckPassphraseService from "../../service/crypto/checkPassphraseService";
import Keyring from "../../model/keyring";
import UpdateSsoCredentialsService from "../../service/account/updateSsoCredentialsService";

class SignInSetupController {
  /**
   * AccountRecoveryContinueController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions
   * @param {AccountEntity} account The account
   * @param {Object} runtimeMemory The setup runtime memory.
   */
  constructor(worker, requestId, apiClientOptions, account, runtimeMemory) {
    this.worker = worker;
    this.requestId = requestId;
    this.account = account;
    this.authModel = new AuthModel(apiClientOptions);
    this.runtimeMemory = runtimeMemory;
    this.updateSsoCredentialsService = new UpdateSsoCredentialsService(apiClientOptions);
    this.checkPassphraseService = new CheckPassphraseService(new Keyring());
  }

  /**
   * Wrapper of exec function to run it with worker.
   * @return {Promise<void>}
   */
  async _exec() {
    try {
      await this.exec.apply(this, arguments);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Sign in.
   * @param {boolean} [rememberMe] Remember the passphrase until signed out, default false
   * @return {Promise<void>}
   */
  async exec(rememberMe = false) {
    if (typeof this.runtimeMemory.passphrase === "undefined") {
      throw new Error("A passphrase is required.");
    }
    if (typeof this.runtimeMemory.passphrase !== "string") {
      throw new Error("The passphrase should be a string.");
    }
    if (typeof rememberMe !== "undefined" && typeof rememberMe !== "boolean") {
      throw new Error("The rememberMe should be a boolean.");
    }

    await this.checkPassphraseService.checkPassphrase(this.runtimeMemory.passphrase);
    await this.updateSsoCredentialsService.forceUpdateSsoKit(this.runtimeMemory.passphrase);

    await this.authModel.login(this.runtimeMemory.passphrase, rememberMe);
    await this.redirectToApp();
  }

  /**
   * Redirect the user to the application
   * @returns {Promise<void>}
   */
  async redirectToApp() {
    const url = this.account.domain;
    browser.tabs.update(this.worker.tab.id, {url});
  }
}

export default SignInSetupController;
