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

import ExportPoliciesSettingsApiService from "../api/exportPolicies/exportPoliciesSettingsApiService";
import ExportPoliciesSettingsEntity from "passbolt-styleguide/src/shared/models/entity/exportSettings/ExportPoliciesSettingsEntity";

/**
 * The service aims to find export policies settings.
 */
export default class FindExportPoliciesSettingsService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(apiClientOptions) {
    this.exportPoliciesSettingsApiService = new ExportPoliciesSettingsApiService(apiClientOptions);
  }

  /**
   * Finds the export policies settings.
   * @returns {Promise<ExportPoliciesSettingsEntity>}
   */
  async find() {
    try {
      const passboltResponse = await this.exportPoliciesSettingsApiService.find();
      return ExportPoliciesSettingsEntity.createFromDefault(passboltResponse.body);
    } catch (error) {
      if (error?.data?.code === 404) {
        return ExportPoliciesSettingsEntity.createFromDefault();
      }
      throw error;
    }
  }
}
