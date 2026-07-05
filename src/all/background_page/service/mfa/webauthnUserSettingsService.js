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

import BrowserTabService from "../ui/browserTab.service";

/**
 * Orchestrates the WebAuthn MFA setup for the current user on Safari.
 *
 * The registration ceremony (navigator.credentials.create) must run on a top-level page served by
 * the passbolt origin so navigator.credentials binds to the correct relying party id. On browsers
 * other than Safari the styleguide navigates the top window with a target="_top" link; Safari
 * handles that differently, so the background page navigates the current tab instead.
 */
export default class WebauthnUserSettingsService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(apiClientOptions) {
    this.apiClientOptions = apiClientOptions;
  }

  /**
   * Starts the WebAuthn MFA setup by redirecting the current tab to the passbolt served setup page.
   * @return {Promise<void>}
   */
  async startSetup() {
    await BrowserTabService.updateCurrentTabUrl(this.setupUrl);
  }

  /**
   * Get the top-level setup page url served by the passbolt origin.
   * @returns {string}
   */
  get setupUrl() {
    const baseUrl = this.apiClientOptions.getBaseUrl().toString().replace(/\/$/, "");
    return `${baseUrl}/mfa/setup/webauthn`;
  }
}
