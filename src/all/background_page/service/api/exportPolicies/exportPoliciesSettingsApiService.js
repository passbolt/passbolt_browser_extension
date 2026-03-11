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
 * @since         v5.10.0
 */

import AbstractService from "../abstract/abstractService";
import ExportPoliciesSettingsEntity from "passbolt-styleguide/src/shared/models/entity/exportSettings/ExportPoliciesSettingsEntity";
import PassboltResponseEntity from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity";

const EXPORT_POLICIES_SETTINGS_RESOURCE_NAME = "export-policies/settings";

class ExportPoliciesSettingsApiService extends AbstractService {
  constructor(apiClientOptions) {
    super(apiClientOptions, ExportPoliciesSettingsApiService.RESOURCE_NAME);
  }

  /**
   * Get settings for export-policies.
   * @returns {Promise<PassboltResponseEntity>} Response with export policies settings
   * @public
   */
  async find() {
    const response = await this.apiClient.findAll();
    const exportPoliciesSettingsEntity = new ExportPoliciesSettingsEntity(response.body);
    return new PassboltResponseEntity({ header: response.header, body: exportPoliciesSettingsEntity.toDto() });
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return EXPORT_POLICIES_SETTINGS_RESOURCE_NAME;
  }
}

export default ExportPoliciesSettingsApiService;
