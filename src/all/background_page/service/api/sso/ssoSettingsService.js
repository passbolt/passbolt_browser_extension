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
import {assertUuid} from "../../../utils/assertions";
import AbstractService from "../abstract/abstractService";

const SSO_SETTINGS_SERVICE_RESOURCE_NAME = '/sso/settings';

class SsoSettingsService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, SsoSettingsService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return SSO_SETTINGS_SERVICE_RESOURCE_NAME;
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
   * Get an SSO settings for a given id
   * @param {uuid} ssoSettingsId
   * @returns {Promise<SsoSettingsDto>}
   */
  async get(ssoSettingsId) {
    assertUuid(ssoSettingsId, "The SSO settings id should be a valid uuid.");

    const response = await this.apiClient.get(ssoSettingsId);
    return response.body;
  }

  /**
   * Get the current SSO settings
   * @param {object} contains
   * @returns
   */
  async getCurrent(contains) {
    const options = contains ? this.formatContainOptions(contains, SsoSettingsService.getSupportedContainOptions()) : null;
    const response = await this.apiClient.get('current', options);
    return response.body;
  }

  /**
   * Save the given SSO settings as draft.
   * @param {SsoSettingsDto} ssoSettings
   */
  async saveDraft(ssoSettings) {
    const response = await this.apiClient.create(ssoSettings);
    return response.body;
  }

  /**
   * Activates the given settings id using the Passbolt API.
   * @param {uuid} ssoSettingsId
   * @param {SsoSettingsActivationDto} activationDto
   */
  async activateSettings(ssoSettingsId, activationDto) {
    assertUuid(ssoSettingsId, "The SSO settings id should be a valid uuid.");

    const response = await this.apiClient.update(ssoSettingsId, activationDto);
    return response.body;
  }

  /**
   * Deletes the given settings id using the Passbolt API.
   * @param {uuid} ssoSettingsId
   */
  async delete(ssoSettingsId) {
    assertUuid(ssoSettingsId, "The SSO settings id should be a valid uuid.");

    const response = await this.apiClient.delete(ssoSettingsId);
    return response.body;
  }
}

export default SsoSettingsService;
