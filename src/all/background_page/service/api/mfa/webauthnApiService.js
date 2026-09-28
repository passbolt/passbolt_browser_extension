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
   * Find all the credentials of the current user.
   * @returns {Promise<PassboltResponseEntity>}
   */
  async findAll() {
    const response = await this.apiClient.findAll();
    return new PassboltResponseEntity(response);
  }

  /**
   * Delete a credential of the current user.
   * @param {string} id the credential id
   * @returns {Promise<void>}
   * @throws {TypeError} if the id is not a uuid
   */
  async delete(id) {
    this.assertValidId(id);
    await this.apiClient.delete(id);
  }

  /**
   * Begin the attestation ceremony.
   * @returns {Promise<PassboltResponseEntity>}
   */
  async begin() {
    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/begin`);
    const response = await this.apiClient.fetchAndHandleResponse("POST", url, "{}");
    return new PassboltResponseEntity(response);
  }

  /**
   * Finish the attestation ceremony.
   * @param {{handle: string, credential: object, name: string}} dto
   * @returns {Promise<PassboltResponseEntity>} verified is the registration date-time
   */
  async finish(dto) {
    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/finish`);
    const response = await this.apiClient.fetchAndHandleResponse("POST", url, JSON.stringify(dto));
    return new PassboltResponseEntity(response);
  }
}
