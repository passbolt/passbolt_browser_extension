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

import AuthModel from "../../model/auth/authModel";
import UserAlreadyLoggedInError from "../../error/userAlreadyLoggedInError";
import SsoKitServerPartModel from "../../model/sso/ssoKitServerPartModel";
import SsoConfigurationModel from "../../model/sso/ssoConfigurationModel";
import OrganizationSettingsModel from "../../model/organizationSettings/organizationSettingsModel";
import GenerateSsoKitService from "../../service/sso/generateSsoKitService";
import SsoDataStorage from "../../service/indexedDB_storage/ssoDataStorage";
import Keyring from "../../model/keyring";
import CheckPassphraseService from "../../service/crypto/checkPassphraseService";

class AuthLoginController {
  /**
   * AuthLoginController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions the api client options
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.authModel = new AuthModel(apiClientOptions);
    this.organizationSettingsModel = new OrganizationSettingsModel(apiClientOptions);
    this.ssoConfigurationModel = new SsoConfigurationModel(apiClientOptions);
    this.ssoKitServerPartModel = new SsoKitServerPartModel(apiClientOptions);
    this.checkPassphraseService = new CheckPassphraseService(new Keyring());
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @param {uuid} requestId The request identifier
   * @param {string} passphrase The passphrase to decryt the private key
   * @param {string} remember whether to remember the passphrase
   *   (bool) false|undefined if should not remember
   *   (integer) -1 if should remember for the session
   *   (integer) duration in seconds to specify a specific duration
   * @return {Promise<void>}
   */
  async _exec(passphrase, remember) {
    try {
      await this.exec(passphrase, remember);
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
   * @param {string} remember whether to remember the passphrase
   *   (bool) false|undefined if should not remember
   *   (integer) -1 if should remember for the session
   *   (integer) duration in seconds to specify a specific duration
   * @return {Promise<void>}
   */
  async exec(passphrase, remember) {
    /*
     * In order to generate the SSO kit, a call to the API is made to retrieve the SSO settings and ensure it's needed.
     * But, for this call we must be logged out or fully logged in (with MFA).
     * In the case when MFA is required, finding the SSO settings is blocked as MFA is demanded.
     * So in order to proceed with the SSO kit and ensure to encrypt a working passphrase, we do a passphrase check first.
     * Then we proceed with the SSO kit and afterward the login process.
     */
    await this.checkPassphraseService.checkPassphrase(passphrase);
    await this.generateSsoKitIfNeeded(passphrase);

    try {
      await this.authModel.login(passphrase, remember);
    } catch (error) {
      if (!(error instanceof UserAlreadyLoggedInError)) {
        throw error;
      }
    }
  }

  /**
   * Check if conditions are to met to generate an SSO kit and generates it if needed.
   *
   * @param {string} passphrase the passphrase to encrypt for the SSO kit.
   * @returns {Promise<void>}
   */
  async generateSsoKitIfNeeded(passphrase) {
    const localSsoKit = await SsoDataStorage.get();
    const organizationSettings = await this.organizationSettingsModel.getOrFind();
    if (!organizationSettings.isPluginEnabled("sso")) {
      /*
       * If the plugin is disabled there is no reason to keep an SSO kit
       * Plus, if we have an SSO kit locally, the login page will continue display the SSO login
       */
      if (localSsoKit) {
        await SsoDataStorage.flush();
      }
      return;
    }

    const currentSsoConfig = await this.ssoConfigurationModel.getCurrent();
    if (!currentSsoConfig?.provider && localSsoKit) {
      /*
       * if we have a local SSO kit but the plugin is not configured
       * it means it has been disabled and there is no point to keep it
       */
      await SsoDataStorage.flush();
    } else if (currentSsoConfig?.provider && !localSsoKit) {
      await GenerateSsoKitService.generate(passphrase, currentSsoConfig.provider);
    }
  }
}

export default AuthLoginController;
