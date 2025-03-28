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

import ResourcesCollection from "../../../model/entity/resource/resourcesCollection";
import {assertType} from "../../../utils/assertions";
import AbstractService from "../abstract/abstractService";
import PassboltResponseEntity from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity";

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
    return [
      "permissions",
    ];
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
   * @returns {Promise<PassboltResponseEntity>}
   * @public
   */
  async findAll(contains = {}, filters = {}) {
    assertType(contains, Object, 'The given contains is not an Object');
    contains = contains ? this.formatContainOptions(contains, MigrateMetadataResourcesApiService.getSupportedContainOptions()) : null;
    filters = filters ? this.formatFilterOptions(filters, MigrateMetadataResourcesApiService.getSupportedFiltersOptions()) : null;

    const options = {...contains, ...filters};
    const response = await this.apiClient.findAll(options);
    return new PassboltResponseEntity(response);
  }

  /**
   * Update the given resources collection for migrating the metadata on the API.
   * @param {ResourcesCollection} resourcesCollection.
   * @param {Object} [filters] Return entities applied filters, example: {is-shared: true}.
   * @returns {Promise<PassboltResponseEntity>}
   * @public
   */
  async migrate(resourcesCollection, contains = {}, filters = {}) {
    assertType(resourcesCollection, ResourcesCollection, 'The given resourcesCollection is not a valid ResourcesCollection');
    contains = contains ? this.formatContainOptions(contains, MigrateMetadataResourcesApiService.getSupportedContainOptions()) : null;
    filters = filters ? this.formatFilterOptions(filters, MigrateMetadataResourcesApiService.getSupportedFiltersOptions()) : null;

    const options = {...contains, ...filters};
    const response = await this.apiClient.create(resourcesCollection.toDto(), options);
    return new PassboltResponseEntity(response);
  }
}

export default MigrateMetadataResourcesApiService;
