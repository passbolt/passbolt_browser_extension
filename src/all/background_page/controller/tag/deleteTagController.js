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

import DeleteTagService from "../../service/tag/deleteTagService";
import { assertUuid } from "../../utils/assertions";

export default class DeleteTagController {
  /**
   * @constructor
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.deleteTagService = new DeleteTagService(apiClientOptions);
  }

  /**
   * Controller executor related to delete a tag
   * @param {string} tagId The id of the tag to delete
   * @returns Promise<void>
   */
  async _exec(tagId) {
    try {
      const result = await this.exec(tagId);
      this.worker.port.emit(this.requestId, "SUCCESS", result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Delete a tags
   * @param {string} tagId The id of the tag to delete
   * @returns {Promise} A Promise that resolves once the operation is done
   * @throws {Error} if tagId is not a valid uuid
   * @throws {PassboltServiceUnavailableError} if service is not reachable
   * @throws {PassboltBadResponseError} if passbolt API responded with non parsable JSON
   * @throws {PassboltApiFetchError} if passbolt API response is not OK (non 2xx status)
   */
  exec(tagId) {
    assertUuid(tagId);
    return this.deleteTagService.delete(tagId);
  }
}
