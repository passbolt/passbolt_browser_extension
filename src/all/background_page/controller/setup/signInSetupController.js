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
import CheckPassphraseService from "../../service/crypto/checkPassphraseService";
import Keyring from "../../model/keyring";
import UpdateSsoCredentialsService from "../../service/account/updateSsoCredentialsService";
import AuthVerifyLoginChallengeService from "../../service/auth/authVerifyLoginChallengeService";
import PassphraseStorageService from "../../service/session_storage/passphraseStorageService";
import PostLoginService from "../../service/auth/postLoginService";
import KeepSessionAliveService from "../../service/session_storage/keepSessionAliveService";
import AccountTemporarySessionStorageService from "../../service/sessionStorage/accountTemporarySessionStorageService";
import FindAccountTemporaryService from "../../service/account/findAccountTemporaryService";

class SignInSetupController {
  /**
   * AccountRecoveryContinueController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.authVerifyLoginChallengeService = new AuthVerifyLoginChallengeService(apiClientOptions);
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
    const temporaryAccount = await FindAccountTemporaryService.exec(this.worker.port._port.name);
    if (typeof temporaryAccount.passphrase === "undefined") {
      throw new Error("A passphrase is required.");
    }
    if (typeof temporaryAccount.passphrase !== "string") {
      throw new Error("The passphrase should be a string.");
    }
    if (typeof rememberMe !== "undefined" && typeof rememberMe !== "boolean") {
      throw new Error("The rememberMe should be a boolean.");
    }

    await this.checkPassphraseService.checkPassphrase(temporaryAccount.passphrase);
    await this.updateSsoCredentialsService.forceUpdateSsoKit(temporaryAccount.passphrase);

    await this.authVerifyLoginChallengeService.verifyAndValidateLoginChallenge(temporaryAccount.account.userKeyFingerprint, temporaryAccount.account.userPrivateArmoredKey, temporaryAccount.passphrase);
    if (rememberMe) {
      await Promise.all([
        PassphraseStorageService.set(temporaryAccount.passphrase, -1),
        KeepSessionAliveService.start(),
      ]);
    } else {
      await PassphraseStorageService.set(temporaryAccount.passphrase, 60);
    }
    await PostLoginService.exec();
    await this.redirectToApp(temporaryAccount.account.domain);
    // Clear all data in the temporary account session storage
    await AccountTemporarySessionStorageService.remove();
  }

  /**
   * Redirect the user to the application
   * @param {string} url The url
   * @returns {Promise<void>}
   */
  async redirectToApp(url) {
    browser.tabs.update(this.worker.tab.id, {url});
  }
}

export default SignInSetupController;
