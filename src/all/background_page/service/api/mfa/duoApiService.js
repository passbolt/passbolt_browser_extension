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
 * @since         5.10.0
 */

import AbstractService from "passbolt-styleguide/src/shared/services/api/abstract/abstractService";

const DUO_MFA_RESOURCE_NAME = "/mfa/setup/duo";

export default class DuoApiService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, DuoApiService.RESOURCE_NAME);
  }

  /**
   * API Duo MFA Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return DUO_MFA_RESOURCE_NAME;
  }

  /**
   * Prompt the user for Duo sign-in by initiating a POST request to the Duo prompt endpoint.
   * Uses a custom fetch strategy if available (e.g. for service worker contexts), otherwise falls back to the native fetch API.
   *
   * @returns {Promise<Response>}
   * @public
   */
  async promptUserForDuoSignin() {
    const url = `${this.apiClient.baseUrl.toString()}/prompt?redirect=/app/settings/mfa/duo`;
    // eslint-disable-next-line no-undef
    const fetchStrategy = typeof customApiClientFetch !== "undefined" ? customApiClientFetch : fetch;
    const options = {
      credentials: "include",
      method: "POST",
      headers: {},
    };
    return await fetchStrategy(url, options);
  }
}
