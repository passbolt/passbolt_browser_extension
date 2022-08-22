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
 * @since         3.0.0
 */
import ResourceModel from "../../model/resource/resourceModel";
import TagService from "../../service/api/tag/tagService";
import TagEntity from "../entity/tag/tagEntity";
import TagsCollection from "../entity/tag/tagsCollection";
import splitBySize from "../../utils/array/splitBySize";

const BULK_OPERATION_SIZE = 5;

class TagModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.tagService = new TagService(apiClientOptions);
    this.resourceModel = new ResourceModel(apiClientOptions);
  }

  /**
   * Find all tags from API and map API result to tag Entity
   *
   * @throws {Error} if API call fails, service unreachable, etc.
   * @return {TagsCollection}
   * @public
   */
  async findAll() {
    const tagsDto = await this.tagService.findAll();
    return new TagsCollection(tagsDto);
  }

  /**
   * Create a tag using Passbolt API
   *
   * @param {string} resourceId uuid
   * @param {TagsCollection} tagsCollection
   * @returns {ResourceEntity}
   * @public
   */
  async updateResourceTags(resourceId, tagsCollection) {
    const tagsDto = await this.tagService.updateResourceTags(resourceId, tagsCollection.toDto());
    const updatedTagsCollection = new TagsCollection(tagsDto);
    return await this.resourceModel.replaceResourceTagsLocally(resourceId, updatedTagsCollection);
  }

  /**
   * Update a tag using Passbolt API
   *
   * @param {TagEntity} tagEntity
   * @returns {Promise<TagEntity>}
   * @public
   */
  async update(tagEntity) {
    const tagDto = await this.tagService.update(tagEntity.id, tagEntity.toDto());
    const updatedTagEntity = new TagEntity(tagDto);
    await this.resourceModel.replaceTagLocally(tagEntity.id, updatedTagEntity);
    return updatedTagEntity;
  }

  /**
   * Delete a tag using Passbolt API
   *
   * @param {string} tagId uuid
   * @returns {Promise<void>}
   * @public
   */
  async delete(tagId) {
    await this.tagService.delete(tagId);
    await this.resourceModel.deleteTagsLocally(tagId);
  }

  /*
   * ==================================================
   * Bulk tag operation
   * ==================================================
   */
  /**
   * Bulk tag resources
   * @param {array} resourcesIds the resources ids
   * @param {TagsCollection} tagsCollection the tags to apply
   * @param {{successCallback: function, errorCallback: function}?} callbacks The intermediate operation callbacks
   * @returns {Promise<array<ResourceEntity>>}
   */
  async bulkTagResources(resourcesIds, tagsCollection, callbacks) {
    let tagCollections = [];

    // Parallelize the operations by chunk of BULK_OPERATION_SIZE operations.
    const chunks = splitBySize(resourcesIds, BULK_OPERATION_SIZE);
    for (const chunkIndex in chunks) {
      const chunk = chunks[chunkIndex];
      const promises = chunk.map(async(resourceId, mapIndex) => {
        const collectionIndex = (chunkIndex * BULK_OPERATION_SIZE) + mapIndex;
        return this._bulkTagResources_tagResource(resourceId, tagsCollection, collectionIndex, callbacks);
      });

      const bulkPromises = await Promise.allSettled(promises);
      const intermediateResult = bulkPromises.map(promiseResult => promiseResult.value);
      tagCollections = [...tagCollections, ...intermediateResult];
    }

    return await this.resourceModel.bulkReplaceResourceTagsLocally(resourcesIds, tagCollections);
  }

  /**
   * Tag a resource for the bulkTagResources function.
   * @param {string} resourceId The resource id to tag
   * @param {TagsCollection} tagsCollection the tags to apply
   * @param {int} collectionIndex The index of the folder in the initial collection
   * @param {{successCallback: function, errorCallback: function}?} callbacks The intermediate operation callbacks
   * @returns {Promise<TagsCollection|Error>}
   * @private
   */
  async _bulkTagResources_tagResource(resourceId, tagsCollection, collectionIndex, callbacks) {
    callbacks = callbacks || {};
    const successCallback = callbacks.successCallback || (() => {});
    const errorCallback = callbacks.errorCallback || (() => {});

    try {
      const resourceEntity = await this.resourceModel.getById(resourceId);
      const updatedTagCollection = new TagsCollection([...tagsCollection.tags, ...resourceEntity.tags]);
      const tagsDto = await this.tagService.updateResourceTags(resourceId, updatedTagCollection.toDto());
      const updatedTagsCollection = new TagsCollection(tagsDto);
      successCallback(updatedTagsCollection, collectionIndex);
      return updatedTagsCollection;
    } catch (error) {
      console.error(error);
      errorCallback(error, collectionIndex);
      return error;
    }
  }
}

export default TagModel;
