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
import SsoSettingsModel from "../../model/sso/ssoSettingsModel";
import {assertUuid} from "../../utils/assertions";

class ActivateSsoSettingsController {
  /**
   * ActivateSsoSettingsController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.ssoSettingsModel = new SsoSettingsModel(apiClientOptions);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @param {uuid} ssoDraftSettingsId the identifier of draft SSO settings to activate
   * @param {uuid} ssoToken the token to provide to activate the SSO settings
   * @return {Promise<void>}
   */
  async _exec(ssoDraftSettingsId, ssoToken) {
    try {
      const ssoSettings = await this.exec(ssoDraftSettingsId, ssoToken);
      this.worker.port.emit(this.requestId, "SUCCESS", ssoSettings);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Activates the SSO settings given an SSO settings id
   *
   * @param {uuid} ssoDraftSettingsId the identifier of draft SSO settings to activate
   * @param {uuid} ssoToken the token to provide to activate the SSO settings
   * @return {Promise<SsoSettingsEntity>}
   */
  async exec(ssoDraftSettingsId, ssoToken) {
    assertUuid(ssoDraftSettingsId, "The SSO settings id should be a valid uuid.");
    assertUuid(ssoToken, "The SSO activation token should be a valid uuid.");

    return await this.ssoSettingsModel.activate(ssoDraftSettingsId, ssoToken);
  }
}

export default ActivateSsoSettingsController;
