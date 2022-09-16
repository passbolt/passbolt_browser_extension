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
 */
import User from "../model/user";
import TagModel from "../model/tag/tagModel";
import TagController from "../controller/tag/tagController";
import TagEntity from "../model/entity/tag/tagEntity";
import TagsCollection from "../model/entity/tag/tagsCollection";


const listen = function(worker) {
  /*
   * Find all the tags
   *
   * @listens passbolt.tags.find-all
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.tags.find-all', async requestId => {
    try {
      const apiOption = await User.getInstance().getApiClientOptions();
      const tagModel = new TagModel(apiOption);
      const tagsCollection = await tagModel.findAll();
      worker.port.emit(requestId, 'SUCCESS', tagsCollection);
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Update resource tags
   *
   * @listens passbolt.tags.update-resource-tags
   * @param requestId {uuid} The request identifier
   * @param resourceId {uuid} The resource identifier
   * @param tagsDto {Object} tags dto
   */
  worker.port.on('passbolt.tags.update-resource-tags', async(requestId, resourceId, tagsDto) => {
    try {
      const apiOption = await User.getInstance().getApiClientOptions();
      const tagModel = new TagModel(apiOption);
      const tagsCollection = new TagsCollection(tagsDto);
      const tags = await tagModel.updateResourceTags(resourceId, tagsCollection);
      worker.port.emit(requestId, 'SUCCESS', tags);
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Add resources tag
   *
   * @listens passbolt.tags.add-resource-tags
   * @param requestId {uuid} The request identifier
   * @param {object} resourcesTagDto {resources: array of uuids, tag: {object}} the tag to add for the resources
   */
  worker.port.on('passbolt.tags.add-resources-tag', async(requestId, resourcesTagDto) => {
    try {
      const apiOption = await User.getInstance().getApiClientOptions();
      const tagController = new TagController(worker, apiOption);
      await tagController.addTagResources(resourcesTagDto.resources, resourcesTagDto.tag);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Update a tag
   *
   * @listens passbolt.tags.update
   * @param requestId {uuid} The request identifier
   * @param tagDto {object} The tag object
   */
  worker.port.on('passbolt.tags.update', async(requestId, tagDto) => {
    try {
      const apiOption = await User.getInstance().getApiClientOptions();
      const tagModel = new TagModel(apiOption);
      const tagEntity = new TagEntity(tagDto);
      const updatedTag = await tagModel.update(tagEntity);
      worker.port.emit(requestId, 'SUCCESS', updatedTag);
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Delete a tag
   *
   * @listens passbolt.tags.delete
   * @param requestId {uuid} The request identifier
   * @param tagId {uuid} The tag identifier
   */
  worker.port.on('passbolt.tags.delete', async(requestId, tagId) => {
    try {
      const apiOption = await User.getInstance().getApiClientOptions();
      const tagModel = new TagModel(apiOption);
      await tagModel.delete(tagId);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error);
    }
  });
};
export const TagEvents = {listen};
