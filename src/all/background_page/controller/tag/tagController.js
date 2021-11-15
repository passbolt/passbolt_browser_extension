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
const progressController = require('../progress/progressController');
const {ResourceModel} = require('../../model/resource/resourceModel');
const {TagModel} = require('../../model/tag/tagModel');
const {TagsCollection} = require('../../model/entity/tag/tagsCollection');
const {i18n} = require("../../sdk/i18n");

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
    this.progressGoal = 100;
    this.progress = 0;
  }

  /**
   * Add tag for the resources
   * @param {array} resourceIds The resource ids.
   * @param {Object} tag The tag to add
   */
  async addTagResources(resourceIds, tag) {
    this.progressGoal = 2 // Initialization + resource to filter
      + resourceIds.length; // #resource add tag
    await progressController.open(this.worker, i18n.t('Adding tag...'), this.progressGoal, i18n.t('Initialize'));
    try {
      const resourceIdsToKeep = await this._keepResourcesTagNotPresent(resourceIds, tag.id);
      if (resourceIdsToKeep.length > 0) {
        await this._taggingResources(resourceIdsToKeep, tag);
      }
      await progressController.update(this.worker, this.progressGoal, i18n.t('Done!'));
      await progressController.close(this.worker);
    } catch (error) {
      await progressController.close(this.worker);
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
    await progressController.update(this.worker, this.progress++, i18n.t('Preparing...'));
    const resourceCollections = await this.resourceModel.getAllByIds(resourceIds);
    const resourceCollectionsToKeep = resourceCollections.filterByTagNotPresent(tagId);
    const resourceIdsToKeep =  resourceCollectionsToKeep.map(resource => resource.id);
    return resourceIdsToKeep;
  }

  /**
   * Update the resources to add the tag
   * @param {array} resourceIds The resource ids.
   * @param {Object} tag The tag
   * @private
   */
  async _taggingResources(resourceIds, tag) {
    await progressController.update(this.worker, this.progress++, i18n.t('Updating resource'));
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
  _handleTagResourceSuccess(resourceNumber, taggedCount) {
    progressController.update(this.worker, this.progress++, i18n.t(`Tagging passwords ${taggedCount}/${resourceNumber}`));
  }

  /**
   * Handle resource tag error
   * @param {int} resourceNumber The number of resource
   * @param {int} taggedCount The number of resource tagged (with success or no)
   * @private
   */
  _handleTagResourceError(resourceNumber, taggedCount) {
    progressController.update(this.worker, this.progress++, i18n.t(`Tagging passwords ${taggedCount}/${resourceNumber}`));
  }
}

exports.TagController = TagController;
