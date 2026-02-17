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
 * @since         5.10.0
 */

import MFAService from "passbolt-styleguide/src/shared/services/api/Mfa/MfaService";
import { assertString } from "../../utils/assertions";
import DuoApiService from "../api/mfa/duoApiService";
import BrowserTabService from "../ui/browserTab.service";
import MfaModel from "passbolt-styleguide/src/shared/models/Mfa/MfaModel";

/**
 * The service aims to orchestrate the enablement of the metadata encryption.
 */
export default class DuoUserSettingsService {
  /**
   * @constructor
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(apiClientOptions) {
    this.duoApiService = new DuoApiService(apiClientOptions);
    this.mfaService = new MFAService(apiClientOptions);
  }

  /**
   * Enables metadata encryption with confuguration that matches a new instance.
   * @param {string} passphrase
   * @return {Promise<void>}
   * @throws {TypeError} if the `passphrase` is not a valid string
   */
  async startSetup() {
    const location = await this.getLocation();
    BrowserTabService.updateCurrentTabUrl(location);
  }

  /**
   * Returns the location to redirect the user to sign in with Duo.
   * @returns {Promise<string>}
   * @private
   */
  async getLocation() {
    const settingsDto = await this.mfaService.findAllSettings();
    const settings = new MfaModel(settingsDto);

    this.assertDuoConfiguration(settings);

    const response = await this.duoApiService.promptUserForDuoSignin();
    const location = response.headers.get("Location"); // works only for Safari

    this.assertDuoUrl(location, settings.duoHostname);
    return location;
  }

  /**
   * Asserts that the given Duo MFA is set properly before going on.
   * @param {MfaModel} settingsEntity
   * @throws {Error} if any of the configuration is not valid.
   * @private
   */
  assertDuoConfiguration(settingsEntity) {
    const errorMessage = "The MFA Duo settings is not valid";
    assertString(settingsEntity.duoHostname, errorMessage);
    assertString(settingsEntity.duoClientId, errorMessage);
    assertString(settingsEntity.duoClientSecret, errorMessage);
  }

  /**
   * Asserts that the given URL is a valid Duo URL.
   * @param {string} urlString
   * @throw {Error} if the URL is not a valid Duo URL.
   * @private
   */
  assertDuoUrl(urlString) {
    assertString(urlString, "The given URL is not a valid string");
    const url = new URL(urlString);
    if (url.protocol !== "https:") {
      throw new Error("The given URL must use the protocol https:");
    }

    // @todo: add later when we are sure the url.host must be the same as in the configuration.
    // if (url.host !== expectedHost) {
    //   throw new Error("The given URL must use the configured domain to sign in with Duo");
    // }
  }
}
