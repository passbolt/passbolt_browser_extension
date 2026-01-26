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
import i18n from "../../sdk/i18n";
import { assertUuid } from "../../utils/assertions";
import TagsCollection from "../../model/entity/tag/tagsCollection";
import ProgressService from "../../service/progress/progressService";
import UpdateResourceTagsService from "../../service/tag/updateResourceTagsService";

export default class AddTagsToResourcesController {
  /**
   * @constructor
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;

    this.updateResourceTagsService = new UpdateResourceTagsService(apiClientOptions);
    this.progressService = new ProgressService(this.worker, i18n.t("Adding tag..."));
  }

  /**
   * Controller executor related to adding some some tags to a resource's tags collection
   * @param {string} resourceIds The ids of the resources to update
   * @param {Array<Object>} tagsDto The tags collection's dto
   * @returns Promise<void>
   */
  async _exec(resourceIds, tagsDto) {
    try {
      const result = await this.exec(resourceIds, tagsDto);
      this.worker.port.emit(this.requestId, "SUCCESS", result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Adding some some tags to a resource's tags collection
   * @param {Array<string>} resourceIds The ids of the resources to update
   * @param {Array<Object>} tagsDto The tags collection's dto
   * @returns {Promise<ResourceEntity>} The updated ResourceEntity
   * @throws {Error} if any resourceId is not a valid uuid
   * @throws {Error} if local storage operation failed
   * @throws {Error} if the resource does not exist in the local storage
   * @throws {TypeError} if resourceIds is not an Array
   * @throws {TypeError} if tags is not an Array
   * @throws {EntityValidationError} if returned local resource is malformed
   * @throws {EntityCollectionError} if returned tags collection is malformed
   * @throws {EntityCollectionError} if given tags collection is malformed
   * @throws {PassboltServiceUnavailableError} if service is not reachable
   * @throws {PassboltBadResponseError} if passbolt API responded with non parsable JSON
   * @throws {PassboltApiFetchError} if passbolt API response is not OK (non 2xx status)
   */
  async exec(resourceIds, tagsDto) {
    const progressGoal =
      2 + // Initialization + resource filtering
      resourceIds.length;
    this.progressService.start(progressGoal, i18n.t("Initialize"));

    if (!Array.isArray(resourceIds)) {
      throw new TypeError("resourceIds is not an Array");
    } else {
      resourceIds.forEach((resourceId) => assertUuid(resourceId));
    }

    if (!Array.isArray(tagsDto)) {
      throw new TypeError("tagsDto is not an Array");
    }

    try {
      this.progressService.finishStep(i18n.t("Preparing..."), true);
      const tags = new TagsCollection(tagsDto);

      this.progressService.finishStep(i18n.t("Updating resource"), true);
      let counter = 0;
      const result = await this.updateResourceTagsService.addTagsToResources(resourceIds, tags, {
        successCallback: this._logProgression(++counter, resourceIds.length),
        errorCallback: this._logProgression(++counter, resourceIds.length),
      });

      this.progressService.finishStep(i18n.t("Done!"), true);
      return result;
    } finally {
      this.progressService.close();
    }
  }

  /**
   * Update the tagging progression
   *
   * @param {number} count
   * @param {number} total
   */
  _logProgression(count, total) {
    this.progressService.finishStep(i18n.t(`Tagging passwords ${count}/${total}`));
  }
}
