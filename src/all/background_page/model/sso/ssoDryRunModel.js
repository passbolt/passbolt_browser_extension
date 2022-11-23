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
import SsoDryRunService from "../../service/api/sso/ssoDryRunService";

/**
 * Model related to the SSO dry run
 */
class SsoDryRunModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.ssoDryRunService = new SsoDryRunService(apiClientOptions);
  }

  /**
   * Get the URL for the popup to run test dry run test.
   * @param {string} providerId the provider identifier
   * @param {uuid} ssoConfigurationId the sso draft configuration id
   * @returns {Promise<URL>}
   */
  async getUrl(providerId, ssoConfigurationId) {
    const dryRunDto = {
      sso_settings_id: ssoConfigurationId
    };
    const dryRunUrl = await this.ssoDryRunService.getUrl(providerId, dryRunDto);
    return new URL(dryRunUrl);
  }
}

export default SsoDryRunModel;
