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
 * @since         4.12.0
 */
import MigrateMetadataResourcesApiService from "../api/migrateMetadata/migrateMetadataResourcesApiService";

export default class FindMetadataMigrateResourcesService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.migrateMetadataResourcesApiService = new MigrateMetadataResourcesApiService(apiClientOptions);
  }

  /**
   * Retrieve the metadata migration details.
   * @param {boolean} [sharedContentOnly=false]
   * @returns {Promise<PassboltResponsePaginationHeaderEntity>}
   * @public
   */
  async findMigrateDetails(sharedContentOnly = false) {
    const filters = {};
    if (sharedContentOnly) {
      filters["is-shared"] = true;
    }

    const apiResponse = await this.migrateMetadataResourcesApiService.findAll({}, filters);
    return apiResponse.header.pagination;
  }
}

