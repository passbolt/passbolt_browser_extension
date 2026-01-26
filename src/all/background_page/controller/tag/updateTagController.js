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
import TagEntity from "../../model/entity/tag/tagEntity";
import UpdateTagService from "../../service/tag/updateTagService";

export default class UpdateTagController {
  /**
   * @constructor
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.updateTagService = new UpdateTagService(apiClientOptions);
  }

  /**
   * Controller executor related to find the tags
   * @returns Promise<void>
   */
  async _exec(tagDto) {
    try {
      const result = await this.exec(tagDto);
      this.worker.port.emit(this.requestId, "SUCCESS", result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Update a tag
   * @param {Object} tagDto The dto of the tag to update
   * @returns {Promise<TagEntity>} The updated tag
   * @throws {TypeError} if tag is not a valid TagEntity dto
   * @throws {PassboltServiceUnavailableError} if service is not reachable
   * @throws {PassboltBadResponseError} if passbolt API responded with non parsable JSON
   * @throws {PassboltApiFetchError} if passbolt API response is not OK (non 2xx status)
   * @throws {CollectionValidationError} if the returned local resources array is malformed
   * @throws {Error} if local storage operation failed
   */
  exec(tagDto) {
    const tag = new TagEntity(tagDto);
    return this.updateTagService.update(tag);
  }
}
