/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.8.0
 */

import CommentModel from "../../model/comment/commentModel";
import Validator from "validator";

class GetCommentsByRessourceController {
  /**
   * GetCommentController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions The api client options.
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.commentModel =  new CommentModel(apiClientOptions);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @return {Promise<void>}
   */
  async _exec(resourceId) {
    try {
      const result = await this.exec(resourceId);
      this.worker.port.emit(this.requestId, "SUCCESS", result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Get all comments associated to a resource.
   *
   * @param {string} resourceId the resource uuid
   * @return {Promise<CommentsCollection>} The list of comments.
   */
  async exec(resourceId) {
    if (!resourceId) {
      throw new TypeError("A resource id is required.");
    }
    if (typeof resourceId !== "string") {
      throw new TypeError("The resource id should be a string.");
    }
    if (!Validator.isUUID(resourceId)) {
      throw new TypeError("The resource id should be a valid uuid.");
    }

    return this.commentModel.findAllByResourceId(resourceId);
  }
}

export default GetCommentsByRessourceController;

