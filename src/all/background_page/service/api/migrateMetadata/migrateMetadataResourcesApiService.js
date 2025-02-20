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

import {assertType} from "../../../utils/assertions";
import AbstractService from "../abstract/abstractService";
import PassboltResponseDto from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity";

const MIGRATE_METADATA_API_SERVICE_RESOURCE_NAME = "metadata/upgrade/resources";

class MigrateMetadataResourcesApiService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, MIGRATE_METADATA_API_SERVICE_RESOURCE_NAME);
  }

  /**
   * Return the list of supported options for the contains option in API find operations
   *
   * @returns {Array<string>} list of supported option
   */
  static getSupportedContainOptions() {
    return [];
  }

  /**
   * Return the list of supported options for the filters option in API find operations
   *
   * @returns {Array<string>} list of supported option
   */
  static getSupportedFiltersOptions() {
    return [
      'is-shared',
    ];
  }

  /**
   * Retrieve the metadata migration details from the API.
   * @param {Object} [contains] Return entities associated models, example: {metadata_private_keys: true}.
   * @param {Object} [filters] Return entities applied filters, example: {deleted: true}.
   * @returns {Promise<PassboltResponseDto>}
   * @public
   */
  async findAll(contains = {}, filters = {}) {
    assertType(contains, Object, 'The given contains is not an Object');
    contains = contains ? this.formatContainOptions(contains, MigrateMetadataResourcesApiService.getSupportedContainOptions()) : null;
    filters = filters ? this.formatFilterOptions(filters, MigrateMetadataResourcesApiService.getSupportedFiltersOptions()) : null;

    const options = {...contains, ...filters};
    const response = await this.apiClient.findAll(options);
    return new PassboltResponseDto(response);
  }
}

export default MigrateMetadataResourcesApiService;
