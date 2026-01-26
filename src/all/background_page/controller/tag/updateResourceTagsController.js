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
import TagsCollection from "../../model/entity/tag/tagsCollection";
import UpdateResourceTagsService from "../../service/tag/updateResourceTagsService";
import { assertUuid } from "../../utils/assertions";

export default class UpdateResourceTagsController {
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
  }

  /**
   * Controller executor related to updating a resource's tags collection
   * @param {string} resourceId The id of the resource to update
   * @param {Object} tagsDto The tags collection's dto
   * @returns Promise<void>
   */
  async _exec(resourceId, tagDto) {
    try {
      const result = await this.exec(resourceId, tagDto);
      this.worker.port.emit(this.requestId, "SUCCESS", result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Update a resource's tags collection
   * @param {string} resourceId The id of the resource to update
   * @param {Object} tagsDto The tags collection's dto
   * @returns {Promise<ResourceEntity>} The updated ResourceEntity
   * @throws {Error} if resourceId is not a valid uuid
   * @throws {Error} if local storage operation failed
   * @throws {Error} if the resource does not exist in the local storage
   * @throws {TypeError} if tags is not a TagsCollection
   * @throws {EntityValidationError} if returned local resource is malformed
   * @throws {EntityCollectionError} if given tags collection is malformed
   * @throws {EntityCollectionError} if returned tags collection is malformed
   * @throws {PassboltServiceUnavailableError} if service is not reachable
   * @throws {PassboltBadResponseError} if passbolt API responded with non parsable JSON
   * @throws {PassboltApiFetchError} if passbolt API response is not OK (non 2xx status)
   */
  exec(resourceId, tagDto) {
    assertUuid(resourceId);
    const tags = new TagsCollection(tagDto);
    return this.updateResourceTagsService.updateResourceTags(resourceId, tags);
  }
}
