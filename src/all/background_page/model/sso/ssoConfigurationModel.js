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
import SsoConfigurationService from "../../service/api/sso/ssoConfigurationService";
import SsoConfigurationEntity from "../entity/sso/ssoConfigurationEntity";

/**
 * Model related to the SSO configuration
 */
class SsoConfigurationModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.ssoConfigurationService = new SsoConfigurationService(apiClientOptions);
  }

  /**
   * Save the given configuration entity as a draft onto the API.
   * @param {SsoConfigurationEntity} ssoConfigurationEntity the entity to save
   * @returns {Promise<SsoConfigurationEntity>} the saved entity
   */
  async saveDraft(ssoConfigurationEntity) {
    const savedDraft = await this.ssoConfigurationService.saveDraft(ssoConfigurationEntity.toDto());
    return new SsoConfigurationEntity(savedDraft);
  }

  /**
   * Return the sso configuration for a given id using Passbolt API.
   *
   * @param {string} ssoConfigurationId uuid
   * @returns {Promise<SsoConfigurationEntity>}
   */
  async getById(ssoConfigurationId) {
    const ssoConfigurationDto = await this.ssoConfigurationService.get(ssoConfigurationId);
    return new SsoConfigurationEntity(ssoConfigurationDto);
  }

  /**
   * Find the current active SSO configuration using Passbolt API
   * @param {object} contains
   * @returns {Promise<SsoConfigurationEntity>}
   */
  async getCurrent(contains) {
    const ssoConfigurationDto = await this.ssoConfigurationService.getCurrent(contains);
    return new SsoConfigurationEntity(ssoConfigurationDto);
  }

  /**
   * Activates an SSO configuration matching a given id using Passbolt API
   *
   * @param {uuid} ssoConfigurationId
   * @param {uuid} ssoToken
   * @returns {Promise<SsoConfigurationEntity>}
   */
  async activate(ssoConfigurationId, ssoToken) {
    const activationDto = {
      token: ssoToken,
      status: "active"
    };
    const savedDraft = await this.ssoConfigurationService.activateConfiguration(ssoConfigurationId, activationDto);
    return new SsoConfigurationEntity(savedDraft);
  }

  /**
   * Deletes an SSO configuration matching a given id using Passbolt API
   *
   * @param {uuid} ssoConfigurationId
   * @returns {Promise<void>}
   */
  async delete(ssoConfigurationId) {
    await this.ssoConfigurationService.delete(ssoConfigurationId);
  }
}

export default SsoConfigurationModel;
