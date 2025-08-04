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
 * @since         5.4.0
 */

import MetadataSetupSettingsApiService from "../api/metadata/metadataSetupSettingsApiService";
import MetadataSetupSettingsEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataSetupSettingsEntity";

/**
 * The service aims to find metadata setup settings.
 */
export default class FindMetadataSetupSettingsService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(apiClientOptions) {
    this.metadataSetupSettingsApiService = new MetadataSetupSettingsApiService(apiClientOptions);
  }

  /**
   * Finds the metadata setup  settings.
   * @returns {Promise<MetadataSetupSettingsEntity>}
   */
  async findSetupSettings() {
    try {
      const passboltResponse = await this.metadataSetupSettingsApiService.find();
      return MetadataSetupSettingsEntity.createFromDefault(passboltResponse.body);
    } catch (e) {
      if (e?.data?.code === 404) {
        return MetadataSetupSettingsEntity.createFromDefault();
      }
      throw e;
    }
  }
}
