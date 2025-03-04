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
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import {assertType, assertUuid} from "../../utils/assertions";
import ResourceTypeService from "../api/resourceType/resourceTypeService";
import ResourceTypeModel from "../../model/resourceType/resourceTypeModel";

/**
 * The service aims to get resources from the local storage if it is set, or retrieve them from the API and
 * set the local storage.
 */
export default class UpdateResourceTypesService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(apiClientOptions) {
    this.resourceTypeService = new ResourceTypeService(apiClientOptions);
    this.resourceTypeModel = new ResourceTypeModel(apiClientOptions);
  }

  /**
   * Undelete a resource type given its id.
   * @param {string} id
   * @returns {Promise<void>}
   */
  async undelete(id) {
    assertUuid(id);
    await this.resourceTypeService.undelete(id);
  }

  /**
   * Undelete all the given resource types.
   * @param {ResourceTypesCollection} resourceTypesCollection
   * @returns {Promise<void>}
   */
  async undeleteAll(resourceTypesCollection) {
    assertType(resourceTypesCollection, ResourceTypesCollection, "The resourceTypesCollection parameter should be a valid ResourceTypesCollection");
    for (let i = 0; i < resourceTypesCollection.items.length; i++) {
      const resourceType = resourceTypesCollection.items[i];
      await this.undelete(resourceType.id);
    }
  }

  /**
   * Delete a resource type given its id.
   * @param {string} id
   * @returns {Promise<void>}
   */
  async delete(id) {
    assertUuid(id);
    await this.resourceTypeService.delete(id);
  }

  /**
   * Delete all the given resource types.
   * @param {ResourceTypesCollection} resourceTypesCollection
   * @returns {Promise<void>}
   */
  async deleteAll(resourceTypesCollection) {
    assertType(resourceTypesCollection, ResourceTypesCollection, "The resourceTypesCollection parameter should be a valid ResourceTypesCollection");
    for (let i = 0; i < resourceTypesCollection.items.length; i++) {
      const resourceType = resourceTypesCollection.items[i];
      await this.delete(resourceType.id);
    }
  }

  /**
   * Update the resource types deleted status.
   * The given collection will be used to call a delete or an undelete on each resource types.
   *
   * @param {ResourceTypesCollection} resourceTypesCollection
   * @returns {Promise<void>}
   */
  async updateAllDeletedStatus(resourceTypesCollection) {
    assertType(resourceTypesCollection, ResourceTypesCollection, "The resourceTypesCollection parameter should be a valid ResourceTypesCollection");
    const resourceTypesToDelete = resourceTypesCollection.items.filter(rt => rt.isDeleted());
    const resourceTypesToUndelete = resourceTypesCollection.items.filter(rt => !rt.isDeleted());

    await this.deleteAll(new ResourceTypesCollection(resourceTypesToDelete, {validate: false}));
    await this.undeleteAll(new ResourceTypesCollection(resourceTypesToUndelete, {validate: false}));

    await this.resourceTypeModel.updateLocalStorage();
  }
}
