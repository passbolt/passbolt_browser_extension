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
 * @since         v3.0.0
 */
import ResourceTypeLocalStorage from "../../service/local_storage/resourceTypeLocalStorage";
import ResourceTypeService from "../../service/api/resourceType/resourceTypeService";
import ResourceTypesCollection from "../entity/resourceType/resourceTypesCollection";
import PassboltApiFetchError from "../../error/passboltApiFetchError";
import Validator from "validator";

class ResourceTypeModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.resourceTypeService = new ResourceTypeService(apiClientOptions);
  }

  /**
   * Update the resourceTypes local storage with the latest API resourceTypes the user has access.
   *
   * @return {ResourceTypesCollection}
   */
  async updateLocalStorage() {
    let resourceTypeDtos = [];
    try {
      resourceTypeDtos = await this.resourceTypeService.findAll();
    } catch (error) {
      // @deprecated to remove with v4. Expect 404 if API < V3, ResourcesTypes has been introduced with v3.
      if (error instanceof PassboltApiFetchError && error.data && error.data.code === 404) {
        console.error(error);
      } else {
        throw error;
      }
    }
    const resourceTypesCollection = new ResourceTypesCollection(resourceTypeDtos);
    await ResourceTypeLocalStorage.set(resourceTypesCollection);
    return resourceTypesCollection;
  }

  /**
   * Get a collection of all resourceTypes from the local storage.
   * If the local storage is unset, initialize it.
   *
   * @return {ResourceTypesCollection}
   */
  async getOrFindAll() {
    const resourceTypeDtos = await ResourceTypeLocalStorage.get();
    if (typeof resourceTypeDtos !== 'undefined') {
      return new ResourceTypesCollection(resourceTypeDtos);
    }
    return this.updateLocalStorage();
  }

  /**
   * Return the secret section of the schema definition for a given resource type id
   *
   * @param {string} resourceTypeId uuid
   * @returns {Promise<Object>}
   */
  async getSecretSchemaById(resourceTypeId) {
    if (!Validator.isUUID(resourceTypeId)) {
      throw new TypeError('The resource type id should be a valid UUID');
    }
    const types = await this.getOrFindAll();
    const type = types.getFirst('id', resourceTypeId);
    if (!type || !type.definition || !type.definition.secret) {
      return undefined;
    }
    return type.definition.secret;
  }
}

export default ResourceTypeModel;
