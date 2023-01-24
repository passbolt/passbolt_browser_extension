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
import OrganizationSettingsModel from "../../model/organizationSettings/organizationSettingsModel";
import SsoSettingsModel from "../../model/sso/ssoSettingsModel";
import SsoDataStorage from "../indexedDB_storage/ssoDataStorage";
import GenerateSsoKitService from "../sso/generateSsoKitService";
import SsoKitServerPartModel from "../../model/sso/ssoKitServerPartModel";
import PassboltApiFetchError from "../../error/passboltApiFetchError";

class UpdateSsoCredentialsService {
  constructor(apiClientOption) {
    this.organisationSettingsModel = new OrganizationSettingsModel(apiClientOption);
    this.ssoSettingsModel = new SsoSettingsModel(apiClientOption);
    this.ssoKitServerPartModel = new SsoKitServerPartModel(apiClientOption);
  }

  /**
   * Clean the SSO kit then regenerate a new one
   * @param {string} passphrase
   * @returns {Promise<ApiClientOptions>}
   */
  async forceUpdateSsoKit(passphrase) {
    const localSsoKitId = (await SsoDataStorage.get())?.id;
    await SsoDataStorage.flush();
    if (localSsoKitId) {
      try {
        await this.ssoKitServerPartModel.deleteSsoKit(localSsoKitId);
      } catch (e) {
        // we assume that the kit migth have been remove from the server already
        if (!(e instanceof PassboltApiFetchError)) {
          throw e;
        }
      }
    }

    await this.updateSsoKitIfNeeded(passphrase);
  }

  /**
   * Updates the current's user SSO kit:
   * - Flush it if one exists and SSO plutin is disabled or the feature is not configured
   * - Creates a new one if none exists and SSO plugin is enabled
   * @param {string} passphrase
   * @returns {Promise<ApiClientOptions>}
   */
  async updateSsoKitIfNeeded(passphrase) {
    const localSsoKit = await SsoDataStorage.get();
    const organizationSettings = await this.organisationSettingsModel.getOrFind();
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
    const currentSsoSettings = await this.ssoSettingsModel.getCurrent();
    if (!currentSsoSettings?.provider && localSsoKit) {
      /*
       * if we have a local SSO kit but the plugin is not configured
       * it means it has been disabled and there is no point to keep it
       */
      await SsoDataStorage.flush();
    } else if (currentSsoSettings?.provider && !localSsoKit) {
      await GenerateSsoKitService.generate(passphrase, currentSsoSettings.provider);
    }
  }
}

export default UpdateSsoCredentialsService;
