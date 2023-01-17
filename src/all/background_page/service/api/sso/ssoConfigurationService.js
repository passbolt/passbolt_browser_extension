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
import AbstractService from "../abstract/abstractService";

const SSO_CONFIGURATION_SERVICE_RESOURCE_NAME = '/sso/settings';

class SsoConfigurationService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, SsoConfigurationService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return SSO_CONFIGURATION_SERVICE_RESOURCE_NAME;
  }

  /**
   * Return the list of supported options for the contain option in API find operations
   *
   * @returns {Array<string>} list of supported option
   */
  static getSupportedContainOptions() {
    return ["data"];
  }

  /**
   * Get an SSO configuration for a given id
   * @param {uuid} ssoConfigurationId
   * @returns {Promise<SsoConfigurationDto>}
   */
  async get(ssoConfigurationId) {
    const response = await this.apiClient.get(ssoConfigurationId);
    return response.body;
  }

  /**
   * Get the current SSO configuration
   * @param {object} contains
   * @returns
   */
  async getCurrent(contains) {
    const options = contains ? this.formatContainOptions(contains, SsoConfigurationService.getSupportedContainOptions()) : null;
    const response = await this.apiClient.get('current', options);
    return response.body;
  }

  /**
   * Save the given SSO configuration as draft.
   * @param {SsoConfigurationDto} ssoConfiguration
   */
  async saveDraft(ssoConfiguration) {
    const response = await this.apiClient.create(ssoConfiguration);
    return response.body;
  }

  /**
   * Activates the given configuration id using the Passbolt API.
   * @param {uuid} configurationId
   * @param {SsoConfigurationActivationDto} activationDto
   */
  async activateConfiguration(configurationId, activationDto) {
    const response = await this.apiClient.update(configurationId, activationDto);
    return response.body;
  }

  /**
   * Deletes the given configuration id using the Passbolt API.
   * @param {uuid} configurationId
   */
  async delete(configurationId) {
    const response = await this.apiClient.delete(configurationId);
    return response.body;
  }
}

export default SsoConfigurationService;
