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
import ResourceModel from "../../model/resource/resourceModel";
import TagModel from "../../model/tag/tagModel";
import TagsCollection from "../../model/entity/tag/tagsCollection";
import i18n from "../../sdk/i18n";
import ProgressService from "../../service/progress/progressService";


class TagController {
  /**
   * TagController constructor
   * @param {Worker} worker
   * @param {ApiClientOptions} clientOptions
   */
  constructor(worker, clientOptions) {
    this.worker = worker;

    // Models
    this.resourceModel = new ResourceModel(clientOptions);
    this.tagModel = new TagModel(clientOptions);

    // Progress
    this.progressService = new ProgressService(this.worker, i18n.t('Adding tag...'));
  }

  /**
   * Add tag for the resources
   * @param {array} resourceIds The resource ids.
   * @param {Object} tag The tag to add
   */
  async addTagResources(resourceIds, tag) {
    const progressGoal = 2 // Initialization + resource to filter
      + resourceIds.length; // #resource add tag
    this.progressService.start(progressGoal, i18n.t('Initialize'));
    try {
      const resourceIdsToKeep = await this._keepResourcesTagNotPresent(resourceIds, tag.id);
      if (resourceIdsToKeep.length > 0) {
        await this._taggingResources(resourceIdsToKeep, tag);
      }
      await this.progressService.finishStep(i18n.t('Done!'), true);
      await this.progressService.close();
    } catch (error) {
      await this.progressService.close();
      throw error;
    }
  }

  /**
   * Keep resource ids if the tag is not present
   * @param {array} resourceIds The resource ids.
   * @param {string} tagId The tag ID
   * @returns {Promise<Array>}
   * @private
   */
  async _keepResourcesTagNotPresent(resourceIds, tagId) {
    await this.progressService.finishStep(i18n.t('Preparing...'), true);
    const resourceCollections = await this.resourceModel.getAllByIds(resourceIds);
    const resourceCollectionsToKeep = resourceCollections.filterByTagNotPresent(tagId);
    const resourceIdsToKeep = resourceCollectionsToKeep.map(resource => resource.id);
    return resourceIdsToKeep;
  }

  /**
   * Update the resources to add the tag
   * @param {array} resourceIds The resource ids.
   * @param {Object} tag The tag
   * @private
   */
  async _taggingResources(resourceIds, tag) {
    await this.progressService.finishStep(i18n.t('Updating resource'), true);
    const tagsCollection = new TagsCollection([tag]);

    // Bulk tag the resources.
    const resourceNumber = resourceIds.length;
    let taggedCount = 0;
    const successCallback = () => this._handleTagResourceSuccess(resourceNumber, ++taggedCount);
    const errorCallback = () => this._handleTagResourceError(resourceNumber, ++taggedCount);

    await this.tagModel.bulkTagResources(resourceIds, tagsCollection, {successCallback: successCallback, errorCallback: errorCallback});
  }

  /**
   * Handle resource tag success
   * @param {int} resourceNumber The number of resource
   * @param {int} taggedCount The number of resource tagged (with success or no)
   * @private
   */
  async _handleTagResourceSuccess(resourceNumber, taggedCount) {
    await this.progressService.finishStep(i18n.t(`Tagging passwords ${taggedCount}/${resourceNumber}`));
  }

  /**
   * Handle resource tag error
   * @param {int} resourceNumber The number of resource
   * @param {int} taggedCount The number of resource tagged (with success or no)
   * @private
   */
  async _handleTagResourceError(resourceNumber, taggedCount) {
    await this.progressService.finishStep(i18n.t(`Tagging passwords ${taggedCount}/${resourceNumber}`));
  }
}

export default TagController;
