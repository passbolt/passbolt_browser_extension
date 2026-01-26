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
 * @since         6.0.0
 */
import ResourceEntity from "../../model/entity/resource/resourceEntity";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import TagsCollection from "../../model/entity/tag/tagsCollection";
import { assertUuid } from "../../utils/assertions";
import TagApiService from "../api/tag/tagApiService";
import ExecuteConcurrentlyService from "../execute/executeConcurrentlyService";
import ResourceLocalStorage from "../local_storage/resourceLocalStorage";

const BULK_OPERATION_SIZE = 5;

export default class UpdateResourceTagsService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(apiClientOptions) {
    this.tagService = new TagApiService(apiClientOptions);
  }

  /**
   * Update a resource's tags collection in the API
   * @private
   * @param {string} resourceId Resource's id
   * @param {TagsCollection} tags The new tags collection (will overwrite the existing)
   * @returns {Promise<TagsCollection>} The tags collection that has been set in the resource
   * @throws {Error} if resourceId is not a valid uuid
   * @throws {TypeError} if tags is not a TagsCollection
   * @throws {EntityCollectionError} if returned tags collection is malformed
   * @throws {PassboltServiceUnavailableError} if service is not reachable
   * @throws {PassboltBadResponseError} if passbolt API responded with non parsable JSON
   * @throws {PassboltApiFetchError} if passbolt API response is not OK (non 2xx status)
   */
  async _updateResourceTagsApi(resourceId, tags) {
    assertUuid(resourceId);
    if (!(tags instanceof TagsCollection)) {
      throw new TypeError("tags is not a TagsCollection");
    }

    const response = await this.tagService.updateResourceTags(resourceId, tags.toDto());
    return new TagsCollection(response.body);
  }

  /**
   * Update a resource's tags collection in the local storage
   * @private
   * @param {string} resourceId Resource's id
   * @param {TagsCollection} tags The new tags collection (will overwrite the existing)
   * @returns {Promise<ResourceEntity>} The updated resource
   * @throws {Error} if resourceId is not a valid uuid
   * @throws {Error} if local storage operation failed
   * @throws {Error} if the resource does not exist in the local storage
   * @throws {TypeError} if tags is not a TagsCollection
   * @throws {EntityValidationError} if returned local resource is malformed
   */
  async _updateResourceTagsLocalStorage(resourceId, tags) {
    assertUuid(resourceId);
    if (!(tags instanceof TagsCollection)) {
      throw new TypeError("tags is not a TagsCollection");
    }

    const resourceDto = await ResourceLocalStorage.getResourceById(resourceId);
    if (!resourceDto) {
      throw new Error(`Resource with id ${resourceId} does not exist.`);
    }

    const resource = new ResourceEntity(resourceDto);
    resource.tags = tags;

    await ResourceLocalStorage.updateResource(resource);

    return resource;
  }

  /**
   * Update a resource's tags collection
   * @param {string} resourceId Resource's id
   * @param {TagsCollection} tags The new tags collection (will overwrite the existing)
   * @returns {Promise<ResourceEntity>} The updated resource
   * @throws {Error} if resourceId is not a valid uuid
   * @throws {Error} if local storage operation failed
   * @throws {Error} if the resource does not exist in the local storage
   * @throws {TypeError} if tags is not a TagsCollection
   * @throws {EntityValidationError} if returned local resource is malformed
   * @throws {EntityCollectionError} if returned tags collection is malformed
   * @throws {PassboltServiceUnavailableError} if service is not reachable
   * @throws {PassboltBadResponseError} if passbolt API responded with non parsable JSON
   * @throws {PassboltApiFetchError} if passbolt API response is not OK (non 2xx status)
   */
  async updateResourceTags(resourceId, tags) {
    const updatedTagsCollection = await this._updateResourceTagsApi(resourceId, tags);
    return this._updateResourceTagsLocalStorage(resourceId, updatedTagsCollection);
  }

  /**
   * Prepare the resources by adding/merging the updated tags into their tags collections in memory
   * @private
   * @param {ResourcesCollection} localResources All local resources
   * @param {Array<string>} resourceIdsToUpdate The ids of the resources to update
   * @param {TagsCollection} tags The tags to add/update in each resource's tags collection
   * @returns {Promise<{ resourcesToUpdate: ResourcesCollection, ignoredResources: ResourcesCollection }>} The resources to update prepared with the updated tags collection
   *                                                                                                       and the ignored ones that already have all the needed tags
   * @throws {Error} if any id of resourceIds is not a valid uuid
   * @throws {Error} if any resource does not exist in the local storage
   * @throws {TypeError} if localResources is not a ResourcesCollection
   * @throws {TypeError} if resourceIdsToUpdate is not an array
   * @throws {TypeError} if tags is not a TagsCollection
   * @throws {EntityValidationError} if returned local resource is malformed
   */
  async _prepareResourcesWithTags(localResources, resourceIdsToUpdate, tags) {
    if (!(localResources instanceof ResourcesCollection)) {
      throw new TypeError("localResources is not a ResourcesCollection");
    }

    if (!(tags instanceof TagsCollection)) {
      throw new TypeError("tags is not a TagsCollection");
    }

    const resourcesToUpdate = new ResourcesCollection();
    const ignoredResources = new ResourcesCollection();

    if (!Array.isArray(resourceIdsToUpdate)) {
      throw new TypeError("resourceIds is not an array");
    } else if (resourceIdsToUpdate.length > 0) {
      // Update resources' tags collections if needed
      for (let resourceId of resourceIdsToUpdate) {
        assertUuid(resourceId);

        const resource = localResources.getFirstById(resourceId);
        if (!resource) {
          throw new Error(`Resource ${resourceId} doesn't exist locally`);
        }

        if (!resource.tags || resource.tags.length === 0) {
          resource.tags = tags;
          resourcesToUpdate.push(resource);
        } else {
          // Filter out resources already having the tags
          const resourceNeedsUpdate = tags.items.some((tag) => {
            const existingTag = resource.tags.getFirst("id", tag.id);
            return typeof existingTag !== "undefined" ? existingTag.hasDiffProps(tag) : true;
          });

          if (resourceNeedsUpdate) {
            resource.tags.pushOrReplaceMany(tags.toDto());
            resourcesToUpdate.push(resource);
          } else {
            ignoredResources.push(resource);
          }
        }
      }
    }

    return { resourcesToUpdate, ignoredResources };
  }

  /**
   * Add or update tags to each resource tags collection using the API service
   * @private
   * @param {ResourcesCollection} resourcesToUpdate The ids of the resources to update
   * @param {{ successCallback?: () => void, errorCallback?: (error: Error) => void }} options The callbacks called after API answer for each resource
   * @returns {Promise<ResourcesCollection>} The **updated** resources
   * @throws {TypeError} if resourcesToUpdate is not a ResourcesCollection
   * @throws {EntityCollectionError} if returned tags collection is malformed
   * @throws {CollectionValidationError} when any resource failed to update (network error, API error, ...) or if any resource is malformed
   */
  async _addTagsToResourcesApi(resourcesToUpdate, options = {}) {
    if (!(resourcesToUpdate instanceof ResourcesCollection)) {
      throw new TypeError("resourcesToUpdate is not a ResourcesCollection");
    } else if (resourcesToUpdate.length === 0) {
      return resourcesToUpdate;
    }

    const updatePromises = resourcesToUpdate.items.map((resource) => async () => {
      const updatedTags = await this._updateResourceTagsApi(resource.id, resource.tags);
      resource.tags = updatedTags;

      // Success callback needs to be called each time a resource is sucessfully updated
      if (typeof options.successCallback === "function") {
        options.successCallback();
      }

      return resource;
    });

    const executeConcurrentlyService = new ExecuteConcurrentlyService();
    const updatedResources = await executeConcurrentlyService.execute(updatePromises, BULK_OPERATION_SIZE, {
      ignoreError: true,
    });

    // Call the error callback for each resource that failed to update
    if (typeof options.errorCallback === "function") {
      for (let updatedResource of updatedResources) {
        if (!(updatedResource instanceof ResourceEntity)) {
          options.errorCallback(updatedResource);
        }
      }
    }

    return new ResourcesCollection(updatedResources);
  }

  /**
   * Add or update tags to each resource tags collection
   * @param {Array<string>} resourceIds The ids of the resources to update
   * @param {TagsCollection} tags The tags to add/update in each resource's tags collection
   * @param {{ successCallback?: () => void, errorCallback?: (error: Error) => void }} options The callbacks called after API answer for each resource
   * @returns {Promise<ResourcesCollection>} The **updated** resources
   * @throws {Error} if any id of resourceIds is not a valid uuid
   * @throws {Error} if local storage operation failed
   * @throws {Error} if any resource does not exist in the local storage
   * @throws {TypeError} if resourceIds is not an array
   * @throws {TypeError} if tags is not a TagsCollection
   * @throws {TypeError} if there is no local resources
   * @throws {EntityValidationError} if returned local resource is malformed
   * @throws {EntityCollectionError} if returned tags collection is malformed
   * @throws {PassboltServiceUnavailableError} if service is not reachable
   * @throws {PassboltBadResponseError} if passbolt API responded with non parsable JSON
   * @throws {PassboltApiFetchError} if passbolt API response is not OK (non 2xx status)
   */
  async addTagsToResources(resourceIds, tags, options = {}) {
    if (!Array.isArray(resourceIds)) {
      throw new TypeError("resourceIds is not an array");
    } else if (resourceIds.length === 0) {
      return new ResourcesCollection();
    }

    let localResourcesDto = await ResourceLocalStorage.get();
    if (!localResourcesDto) {
      throw new TypeError("No local resources found");
    }

    const localResources = new ResourcesCollection(localResourcesDto);
    const { resourcesToUpdate, ignoredResources } = await this._prepareResourcesWithTags(
      localResources,
      resourceIds,
      tags,
    );

    if (ignoredResources.length > 0) {
      // If the resource already has all the tags it will be ignored for the rest of the process
      // We still need to mark them as succeeded for the caller
      if (typeof options.successCallback === "function") {
        options.successCallback();
      }
    }

    let updatedResources = resourcesToUpdate;
    if (resourcesToUpdate.length > 0) {
      updatedResources = await this._addTagsToResourcesApi(resourcesToUpdate, options);

      // Update the resources in the local storage, merging the updated ones with the rest
      localResources.updateWithCollection(updatedResources);
      await ResourceLocalStorage.set(localResources);
    }

    // Put back the ignored ones so the caller gets as many resources as they asked
    updatedResources.updateWithCollection(ignoredResources);
    return updatedResources;
  }
}
