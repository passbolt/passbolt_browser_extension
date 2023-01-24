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
import SsoSettingsEntity from "../../model/entity/sso/ssoSettingsEntity";
import SsoSettingsModel from "../../model/sso/ssoSettingsModel";

class SaveSsoSettingsAsDraftController {
  /**
   * SaveSsoSettingsAsDraftController constructor
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
   * @param {SsoSettingsDto} ssoSettings the draft SSO settings to save
   * @return {Promise<void>}
   */
  async _exec(draftSsoSettings) {
    try {
      const savedSsoSettings = await this.exec(draftSsoSettings);
      this.worker.port.emit(this.requestId, "SUCCESS", savedSsoSettings);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Get the current SSO settings.
   *
   * @param {SsoSettingsDto} ssoSettings the draft SSO settings to save
   * @return {Promise<SsoSettingsModel|null>}
   */
  async exec(draftSsoSettings) {
    const ssoSettingsEntity = new SsoSettingsEntity(draftSsoSettings);
    return this.ssoSettingsModel.saveDraft(ssoSettingsEntity);
  }
}

export default SaveSsoSettingsAsDraftController;
