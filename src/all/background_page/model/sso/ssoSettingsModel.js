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
import SsoSettingsService from "../../service/api/sso/ssoSettingsService";
import SsoSettingsEntity from "../entity/sso/ssoSettingsEntity";

/**
 * Model related to the SSO Settings
 */
class SsoSettingsModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.ssoSettingsService = new SsoSettingsService(apiClientOptions);
  }

  /**
   * Save the given settings entity as a draft onto the API.
   * @param {SsoSettingsEntity} ssoSettingsEntity the entity to save
   * @returns {Promise<SsoSettingsEntity>} the saved entity
   */
  async saveDraft(ssoSettingsEntity) {
    const savedDraft = await this.ssoSettingsService.saveDraft(ssoSettingsEntity.toDto());
    return new SsoSettingsEntity(savedDraft);
  }

  /**
   * Return the sso settings for a given id using Passbolt API.
   *
   * @param {string} ssoSettingsId uuid
   * @returns {Promise<SsoSettingsEntity>}
   */
  async getById(ssoSettingsId) {
    const ssoSettingsDto = await this.ssoSettingsService.get(ssoSettingsId);
    return new SsoSettingsEntity(ssoSettingsDto);
  }

  /**
   * Find the current active SSO settings using Passbolt API
   * @param {object} contains
   * @returns {Promise<SsoSettingsEntity>}
   */
  async getCurrent(contains) {
    const ssoSettingsDto = await this.ssoSettingsService.getCurrent(contains);
    return new SsoSettingsEntity(ssoSettingsDto);
  }

  /**
   * Activates an SSO settings matching a given id using Passbolt API
   *
   * @param {uuid} ssoSettingsId
   * @param {uuid} ssoToken
   * @returns {Promise<SsoSettingsEntity>}
   */
  async activate(ssoSettingsId, ssoToken) {
    const activationDto = {
      token: ssoToken,
      status: "active"
    };
    const savedDraft = await this.ssoSettingsService.activateSettings(ssoSettingsId, activationDto);
    return new SsoSettingsEntity(savedDraft);
  }

  /**
   * Deletes an SSO settings matching a given id using Passbolt API
   *
   * @param {uuid} ssoSettingsId
   * @returns {Promise<void>}
   */
  async delete(ssoSettingsId) {
    await this.ssoSettingsService.delete(ssoSettingsId);
  }
}

export default SsoSettingsModel;
