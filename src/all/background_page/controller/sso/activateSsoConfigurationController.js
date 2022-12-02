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
import SsoConfigurationModel from "../../model/sso/ssoConfigurationModel";
import Validator from "validator";

class ActivateSsoConfigurationController {
  /**
   * ActivateSsoConfigurationController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.ssoConfigurationModel = new SsoConfigurationModel(apiClientOptions);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @param {uuid} ssoDraftConfigurationId the identifier of draft SSO configuration to activate
   * @param {uuid} ssoToken the token to provide to activate the SSO configuration
   * @return {Promise<void>}
   */
  async _exec(ssoDraftConfigurationId, ssoToken) {
    try {
      const ssoConfiguration = await this.exec(ssoDraftConfigurationId, ssoToken);
      this.worker.port.emit(this.requestId, "SUCCESS", ssoConfiguration);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Get the current user's passphrase using SSO authentication.
   *
   * @param {uuid} ssoDraftConfigurationId the identifier of draft SSO configuration to activate
   * @param {uuid} ssoToken the token to provide to activate the SSO configuration
   * @return {Promise<SsoConfigurationEntity>}
   */
  async exec(ssoDraftConfigurationId, ssoToken) {
    if (!Validator.isUUID(ssoDraftConfigurationId)) {
      throw new TypeError('The SSO configuration id should be a valid uuid.');
    }

    if (!Validator.isUUID(ssoToken)) {
      throw new TypeError('The SSO activation token should be a valid uuid.');
    }

    return await this.ssoConfigurationModel.activate(ssoDraftConfigurationId, ssoToken);
  }
}

export default ActivateSsoConfigurationController;
