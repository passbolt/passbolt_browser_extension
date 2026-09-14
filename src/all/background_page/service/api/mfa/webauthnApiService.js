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
import AbstractService from "passbolt-styleguide/src/shared/services/api/abstract/abstractService";

const WEBAUTHN_MFA_RESOURCE_NAME = "/mfa/setup/webauthn";

export default class WebauthnApiService extends AbstractService {
  /**
   * Constructor
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, WebauthnApiService.RESOURCE_NAME);
  }

  /**
   * API WebAuthn MFA resource name
   * @returns {string}
   */
  static get RESOURCE_NAME() {
    return WEBAUTHN_MFA_RESOURCE_NAME;
  }

  /**
   * Begin the attestation ceremony.
   * @returns {Promise<{handle: string, credentialCreationOptions: object}>}
   */
  async begin() {
    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/begin`);
    const response = await this.apiClient.fetchAndHandleResponse("POST", url, "{}");
    return response.body;
  }

  /**
   * Finish the attestation ceremony.
   * @param {{handle: string, credential: object, name: string}} dto
   * @returns {Promise<{verified: string}>} verified is the enrolment date-time
   */
  async finish(dto) {
    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/finish`);
    const response = await this.apiClient.fetchAndHandleResponse("POST", url, JSON.stringify(dto));
    return response.body;
  }
}
