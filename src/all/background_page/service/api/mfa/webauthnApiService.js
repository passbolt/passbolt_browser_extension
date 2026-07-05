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

const WEBAUTHN_MFA_RESOURCE_NAME = "/mfa/setup/webauthn";

export default class WebauthnApiService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, WebauthnApiService.RESOURCE_NAME);
  }

  /**
   * API WebAuthn MFA resource name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return WEBAUTHN_MFA_RESOURCE_NAME;
  }

  /**
   * Retrieve the current user's registered security keys.
   *
   * @returns {Promise<object>} The response body ({credentials: [...]})
   * @public
   */
  async findAllCredentials() {
    const response = await this.apiClient.findAll();
    return response.body;
  }

  /**
   * Remove one of the current user's registered security keys.
   *
   * @param {string} credentialId The base64url credential id
   * @returns {Promise<void>}
   * @public
   */
  async removeCredential(credentialId) {
    await this.apiClient.delete(credentialId);
  }
}
