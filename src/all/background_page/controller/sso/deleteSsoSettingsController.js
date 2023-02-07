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

class DeleteSsoSettingsController {
  /**
   * DeleteSsoSettingsController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.ssoSettingsModel = new SsoSettingsModel(apiClientOptions);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @param {uuid} ssoSettingsId the SSO settings to delete
   * @return {Promise<void>}
   */
  async _exec(ssoSettingsId) {
    try {
      await this.exec(ssoSettingsId);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Delete the SSO settings matching the given id.
   *
   * @param {uuid} ssoSettingsId the SSO settings to delete
   * @return {Promise<void>}
   */
  async exec(ssoSettingsId) {
    assertUuid(ssoSettingsId, "The SSO settings id should be a valid uuid.");

    await this.ssoSettingsModel.delete(ssoSettingsId);
  }
}

export default DeleteSsoSettingsController;
