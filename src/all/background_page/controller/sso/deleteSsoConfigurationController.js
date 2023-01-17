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

class DeleteSsoConfigurationController {
  /**
   * DeleteSsoConfigurationController constructor
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
   * @param {uuid} ssoConfigurationId the SSO configuration to delete
   * @return {Promise<void>}
   */
  async _exec(ssoConfigurationId) {
    try {
      await this.exec(ssoConfigurationId);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Delete the SSO configuration matching the given id.
   *
   * @param {uuid} ssoConfigurationId the SSO configuration to delete
   * @return {Promise<void>}
   */
  async exec(ssoConfigurationId) {
    if (!Validator.isUUID(ssoConfigurationId)) {
      throw new Error("A valid SSO settings id is required.");
    }
    await this.ssoConfigurationModel.delete(ssoConfigurationId);
  }
}

export default DeleteSsoConfigurationController;
