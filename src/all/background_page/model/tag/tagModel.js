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
const {TagEntity} = require('../entity/tag/tagEntity');
const {TagsCollection} = require('../entity/tag/tagsCollection');
const {TagService} = require('../../service/api/tag/tagService');
const {ResourceEntity} = require('../entity/resource/resourceEntity');
const {ResourceModel} = require('../../model/resource/resourceModel');

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
   */
  async updateResourceTags(resourceId, tagsCollection) {
    const tagsDto = await this.tagService.updateResourceTags(resourceId, tagsCollection.toDto());
    const updatedTagsCollection = new TagsCollection(tagsDto);
    return await this.resourceModel.updateResourceTagsLocally(resourceId, updatedTagsCollection);
  }

  /**
   * Update a tag using Passbolt API
   *
   * @param {TagEntity} tagEntity
   * @returns {Promise<TagEntity>}
   */
  async update(tagEntity) {
    const tagDto = await this.tagService.update(tagEntity.id, tagEntity.toDto());
    const updatedTagEntity = new TagEntity(tagDto);
    await this.resourceModel.updateTagLocally(updatedTagEntity);
    return updatedTagEntity;
  }

  /**
   * Delete a tag using Passbolt API
   *
   * @param {string} tagId uuid
   * @returns {Promise<void>}
   */
  async delete(tagId) {
    await this.tagService.delete(tagId);
    await this.resourceModel.deleteTagsLocally(tagId);
  }
}

exports.TagModel = TagModel;
