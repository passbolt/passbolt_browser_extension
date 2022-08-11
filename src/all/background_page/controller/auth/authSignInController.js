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
import browser from "webextension-polyfill";
import AuthModel from "../../model/auth/authModel";


class AuthSignInController {
  /**
   * AccountRecoveryContinueController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions
   * @param {AccountEntity} account The account
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.account = account;
    this.authModel = new AuthModel(apiClientOptions);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @param {string} passphrase The passphrase to verify
   * @param {boolean} [rememberMe] Remember the passphrase until signed out, default false
   * @return {Promise<void>}
   */
  async _exec(passphrase, rememberMe) {
    try {
      await this.exec(passphrase, rememberMe);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Sign in.
   *
   * @param {string} passphrase The passphrase to verify
   * @param {boolean} [rememberMe] Remember the passphrase until signed out, default false
   * @return {Promise<void>}
   */
  async exec(passphrase, rememberMe = false) {
    if (typeof passphrase === "undefined") {
      throw new Error("A passphrase is required.");
    }
    if (typeof passphrase !== "string") {
      throw new Error("The passphrase should be a string.");
    }
    if (typeof rememberMe !== "undefined" && typeof rememberMe !== "boolean") {
      throw new Error("The rememberMe should be a boolean.");
    }
    await this.authModel.login(passphrase, Boolean(rememberMe));
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

export default AuthSignInController;
