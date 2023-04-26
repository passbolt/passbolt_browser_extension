/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.0.0
 */

import SsoSettingsModel from "../../model/sso/ssoSettingsModel";
import QualifySsoLoginErrorService from "../../service/sso/qualifySsoLoginErrorService";

class GetQualifiedSsoLoginErrorController {
  /**
   * HasSsoLoginErrorController constructor
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
   * @return {Promise<void>}
   */
  async _exec() {
    try {
      const qualifiedError = await this.exec();
      this.worker.port.emit(this.requestId, "SUCCESS", qualifiedError);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Returns a qualified SSO login Error
   *
   * @return {Promise<Error>}
   */
  async exec() {
    const ssoSettings = await this.ssoSettingsModel.getCurrent();
    return await QualifySsoLoginErrorService.qualifyErrorFromConfiguration(ssoSettings);
  }
}

export default GetQualifiedSsoLoginErrorController;
