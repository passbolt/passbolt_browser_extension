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
 * @since         3.9.0
 */
import UserAlreadyLoggedInError from "../../error/userAlreadyLoggedInError";
import Keyring from "../../model/keyring";
import CheckPassphraseService from "../../service/crypto/checkPassphraseService";
import UpdateSsoCredentialsService from "../../service/account/updateSsoCredentialsService";
import UserRememberMeLatestChoiceLocalStorage from "../../service/local_storage/userRememberMeLatestChoiceLocalStorage";
import UserRememberMeLatestChoiceEntity from "../../model/entity/rememberMe/userRememberMeLatestChoiceEntity";
import PassphraseStorageService from "../../service/session_storage/passphraseStorageService";
import PostLoginService from "../../service/auth/postLoginService";
import AuthVerifyLoginChallengeService from "../../service/auth/authVerifyLoginChallengeService";
import KeepSessionAliveService from "../../service/session_storage/keepSessionAliveService";
import AccountTemporarySessionStorageService from "../../service/sessionStorage/accountTemporarySessionStorageService";
import AccountLocalStorage from "../../service/local_storage/accountLocalStorage";
import AccountAccountRecoveryEntity from "../../model/entity/account/accountAccountRecoveryEntity";
import FindAccountTemporaryService from "../../service/account/findAccountTemporaryService";

class AccountRecoveryLoginController {
  /**
   * AccountRecoveryLoginController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions the api client options
   * @param {AccountAccountRecoveryEntity} account The user account
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.authVerifyLoginChallengeService = new AuthVerifyLoginChallengeService(apiClientOptions);
    this.updateSsoCredentialsService = new UpdateSsoCredentialsService(apiClientOptions);
    this.checkPassphraseService = new CheckPassphraseService(new Keyring());
    this.userRememberMeLatestChoiceLocalStorage = new UserRememberMeLatestChoiceLocalStorage(account);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @param {string} passphrase The passphrase to decryt the private key
   * @param {boolean} remember whether to remember the passphrase or not
   * @param {boolean} shouldRefreshCurrentTab should refresh the current tab
   * @return {Promise<void>}
   */
  async _exec(passphrase, remember, shouldRefreshCurrentTab = false) {
    try {
      await this.exec(passphrase, remember, shouldRefreshCurrentTab);
      this.worker.port.emit(this.requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Attemps to sign in the current user.
   *
   * @param {string} passphrase The passphrase to decryt the private key
   * @param {boolean} rememberMe whether to remember the passphrase
   * @return {Promise<void>}
   */
  async exec(passphrase, rememberMe) {
    const temporaryAccount = await FindAccountTemporaryService.exec(this.worker.port._port.name);
    if (typeof passphrase === "undefined") {
      throw new Error("A passphrase is required.");
    }
    if (typeof passphrase !== "string") {
      throw new Error("The passphrase should be a string.");
    }
    if (typeof rememberMe !== "undefined" && typeof rememberMe !== "boolean") {
      throw new Error("The rememberMe should be a boolean.");
    }

    /*
     * In order to generate the SSO kit, a call to the API is made to retrieve the SSO settings and ensure it's needed.
     * But, for this call we must be logged out or fully logged in (with MFA).
     * In the case when MFA is required, finding the SSO settings is blocked as MFA is demanded.
     * So in order to proceed with the SSO kit and ensure to encrypt a working passphrase, we do a passphrase check first.
     * Then we proceed with the SSO kit and afterward the login process.
     */
    await this.checkPassphraseService.checkPassphrase(passphrase);
    try {
      await this.updateSsoCredentialsService.updateSsoKitIfNeeded(passphrase);
    } catch (e) {
      // If something goes wrong we just log the error and do not block the login
      console.error(e);
    }

    try {
      await this.authVerifyLoginChallengeService.verifyAndValidateLoginChallenge(temporaryAccount.account.userKeyFingerprint, temporaryAccount.account.userPrivateArmoredKey, passphrase);
      /*
       * Post login operations
       * MFA may not be complete yet, so no need to preload things here
       */
      if (rememberMe) {
        await Promise.all([
          PassphraseStorageService.set(passphrase, -1),
          KeepSessionAliveService.start(),
        ]);
      } else {
        await PassphraseStorageService.set(passphrase, 60);
      }
      await PostLoginService.exec();
      await this.registerRememberMeOption(rememberMe);
    } catch (error) {
      if (!(error instanceof UserAlreadyLoggedInError)) {
        throw error;
      }
    }


    await this.redirectToApp(temporaryAccount.account.domain);
    // Remove from the local storage the account recovery used to initiate/complete the account recovery.
    await AccountLocalStorage.deleteByUserIdAndType(temporaryAccount.account.userId, AccountAccountRecoveryEntity.TYPE_ACCOUNT_ACCOUNT_RECOVERY);
    // Remove account temporary when an account recovery process is finished
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

  /**
   * Handles the registration of the rememberMe choice from the user so it can be used next time.
   * @param {boolean} rememberMe
   * @returns {Promise<void>}
   */
  async registerRememberMeOption(rememberMe) {
    const duration = rememberMe ? -1 : 0;
    const userRememberMeLatestChoiceEntity = new UserRememberMeLatestChoiceEntity({duration});
    await this.userRememberMeLatestChoiceLocalStorage.set(userRememberMeLatestChoiceEntity);
  }
}

export default AccountRecoveryLoginController;
