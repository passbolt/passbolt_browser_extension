/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         5.17.0
 */
import PassboltResponseEntity from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity";
import AbstractService from "passbolt-styleguide/src/shared/services/api/abstract/abstractService";

const WEBAUTHN_SETTINGS_RESOURCE_NAME = "/mfa/settings/webauthn";

export default class WebauthnSettingsApiService extends AbstractService {
  /**
   * Constructor
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, WebauthnSettingsApiService.RESOURCE_NAME);
  }

  /**
   * API WebAuthn MFA settings resource name
   * @returns {string}
   */
  static get RESOURCE_NAME() {
    return WEBAUTHN_SETTINGS_RESOURCE_NAME;
  }

  /**
   * Find the organisation WebAuthn settings.
   * @returns {Promise<object>}
   */
  async find() {
    const response = await this.apiClient.findAll();
    return new PassboltResponseEntity(response);
  }
}
