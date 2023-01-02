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
import SsoKitServerPartModel from "../../model/sso/ssoKitServerPartModel";
import SsoConfigurationModel from "../../model/sso/ssoConfigurationModel";
import GenerateSsoKitService from "../../service/sso/generateSsoKitService";
import SsoDataStorage from "../../service/indexedDB_storage/ssoDataStorage";
import {PassphraseController} from "../passphrase/passphraseController";

class GenerateSsoKitController {
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
    this.organizationSettingsModel = new GenerateSsoKitService(apiClientOptions);
    this.ssoConfigurationModel = new SsoConfigurationModel(apiClientOptions);
    this.ssoKitServerPartModel = new SsoKitServerPartModel(apiClientOptions);
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
  async _exec(provider) {
    try {
      await this.exec(provider);
      this.worker.port.emit(this.requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Attemps to sign in the current user.
   *
   * @param {string} provider the SSO provider id
   * @return {Promise<void>}
   */
  async exec(provider) {
    const passphrase = await PassphraseController.get(this.worker);
    const currentKit = await SsoDataStorage.get();

    // A kit already exists
    if (currentKit) {
      // if the provider change, the kit is still usable, just the provider id needs to be changed
      if (currentKit?.provider !== provider) {
        currentKit.provider = provider;
        await SsoDataStorage.save(currentKit);
      }
      return;
    }

    // No SSO kit is avaible, we need to generate a new one.
    const ssoKits = await GenerateSsoKitService.generateSsoKits(passphrase, provider);

    const registeredServerPartSsoKit = await this.ssoKitServerPartModel.setupSsoKit(ssoKits.serverPart);
    ssoKits.clientPart.id = registeredServerPartSsoKit.id;
    await SsoDataStorage.save(ssoKits.clientPart);
  }
}

export default GenerateSsoKitController;
