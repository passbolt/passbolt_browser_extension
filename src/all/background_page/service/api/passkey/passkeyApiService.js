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
 * @since         5.14.0
 */
import AbstractService from "passbolt-styleguide/src/shared/services/api/abstract/abstractService";

const PASSKEY_RESOURCE_NAME = "/passkey";

/**
 * API client for the passkey endpoints. The ceremony "begin" and the WebAuthn call
 * happen at the passbolt origin (ceremony page / injected content script); the extension only calls
 * the "finish" endpoints (with the kit it owns) and the management endpoints.
 */
class PasskeyApiService extends AbstractService {
  /**
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, PasskeyApiService.RESOURCE_NAME);
  }

  /**
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return PASSKEY_RESOURCE_NAME;
  }

  /**
   * Begin enrollment: get the creation options and a challenge token (authenticated).
   *
   * @returns {Promise<Object>} {token, credentialCreationOptions}
   */
  async beginSetup() {
    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/setup/begin`);
    const response = await this.apiClient.fetchAndHandleResponse("POST", url, this.apiClient.buildBody({}));
    return response.body;
  }

  /**
   * Begin login: get the request options and a challenge token for the target user (unauthenticated).
   *
   * @param {string} userId The target user id
   * @returns {Promise<Object>} {token, credentialRequestOptions}
   */
  async beginLogin(userId) {
    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/login/begin`);
    const response = await this.apiClient.fetchAndHandleResponse(
      "POST",
      url,
      this.apiClient.buildBody({ user_id: userId }),
    );
    return response.body;
  }

  /**
   * Collect the raw credential the top-level ceremony page deposited onto the challenge token.
   *
   * @param {Object} dto {user_id, token, mode}
   * @returns {Promise<Object>} {credential}
   */
  async collect(dto) {
    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/collect`);
    const response = await this.apiClient.fetchAndHandleResponse("POST", url, this.apiClient.buildBody(dto));
    return response.body;
  }

  /**
   * Finish enrollment: store the credential and the server half of the kit.
   *
   * @param {Object} dto {token, credential, server_kit_key, name}
   * @returns {Promise<Object>} the stored credential summary
   */
  async finishSetup(dto) {
    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/setup/finish`);
    const response = await this.apiClient.fetchAndHandleResponse("POST", url, this.apiClient.buildBody(dto));
    return response.body;
  }

  /**
   * Finish login: verify the assertion and get back the server half of the kit.
   *
   * @param {Object} dto {user_id, token, credential}
   * @returns {Promise<Object>} {server_kit_key}
   */
  async finishLogin(dto) {
    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/login/finish`);
    const response = await this.apiClient.fetchAndHandleResponse("POST", url, this.apiClient.buildBody(dto));
    return response.body;
  }

  /**
   * List the current user's passkey credentials (management UI).
   *
   * @returns {Promise<Array>}
   */
  async findAllCredentials() {
    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/settings`);
    const response = await this.apiClient.fetchAndHandleResponse("GET", url);
    return response.body;
  }

  /**
   * Delete one passkey credential.
   *
   * @param {string} credentialId base64url credential id
   * @returns {Promise<void>}
   */
  async deleteCredential(credentialId) {
    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/settings/${credentialId}`);
    await this.apiClient.fetchAndHandleResponse("DELETE", url);
  }

  /**
   * Whether passkey login is enabled for the organization (unauthenticated-readable).
   *
   * @returns {Promise<boolean>}
   */
  async isOrganizationEnabled() {
    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/organization/settings`);
    const response = await this.apiClient.fetchAndHandleResponse("GET", url);
    return Boolean(response.body?.enabled);
  }

  /**
   * Enable or disable passkey login for the organization (administrator only).
   *
   * @param {boolean} enabled
   * @returns {Promise<boolean>}
   */
  async setOrganizationEnabled(enabled) {
    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/organization/settings`);
    const response = await this.apiClient.fetchAndHandleResponse("POST", url, this.apiClient.buildBody({ enabled }));
    return Boolean(response.body?.enabled);
  }
}

export default PasskeyApiService;
