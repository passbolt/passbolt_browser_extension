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
 * @since         3.7.3
 */
import SsoConfigurationModel from "../../model/sso/ssoConfigurationModel";

class GetSsoConfigurationController {
  /**
   * GetSsoConfigurationController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.ssoConfigurationModel = new SsoConfigurationModel(apiClientOptions);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @return {Promise<SsoConfigurationEntity|null>}
   */
  async _exec() {
    try {
      const ssoConfiguration = await this.exec();
      this.worker.port.emit(this.requestId, "SUCCESS", ssoConfiguration);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Get the current SSO configuration.
   *
   * @return {Promise<SsoConfigurationModel|null>}
   */
  async exec() {
    return this.ssoConfigurationModel.findSsoConfiguration();
  }
}

export default GetSsoConfigurationController;
