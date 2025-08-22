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
 * @since         v5.5.0
 */

import AbstractService from "../abstract/abstractService";
import ResourcesCollection from "../../../model/entity/resource/resourcesCollection";
import {assertType} from "../../../utils/assertions";

const METADATA_ROTATE_KEYS_RESOURCES_API_SERVICE_RESOURCE_NAME = "metadata/rotate-key/resources";

class MetadataRotateKeysResourcesApiService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, METADATA_ROTATE_KEYS_RESOURCES_API_SERVICE_RESOURCE_NAME);
  }

  /**
   * Retrieve the resources that are using an expired key that needs to/can be rotated from the API.
   * @returns {Promise<Array>}
   * @public
   */
  async findAll() {
    const response = await this.apiClient.findAll();
    if (!response.body || !response.body.length) {
      return [];
    }

    return response.body;
  }

  /**
   * Rotate metadata of resources collection Passbolt API
   *
   * @param {ResourcesCollection} resourceCollection The resource collection to rotate
   * @returns {Promise<*>} Response body
   * @throws {TypeError} if the `resourceCollection` argument is not of type ResourcesCollection
   * @public
   */
  async rotate(resourceCollection) {
    assertType(resourceCollection, ResourcesCollection);
    const data = resourceCollection.toDto();
    const response = await this.apiClient.create(data);
    return response.body;
  }
}

export default MetadataRotateKeysResourcesApiService;
