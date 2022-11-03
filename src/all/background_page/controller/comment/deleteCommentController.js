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

class DeleteCommentController {
  /**
   * DeleteCommentController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions The api client options.
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.commentModel = new CommentModel(apiClientOptions);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @return {Promise<void>}
   */
  async _exec(commentId) {
    try {
      await this.exec(commentId);
      this.worker.port.emit(this.requestId, "SUCCESS", commentId);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Delete a comment
   * @param {string} commentId The comment id to delete
   * @return {Promise<void>}
   */
  async exec(commentId) {
    if (!commentId) {
      throw new Error("A comment id is required.");
    }
    if (typeof commentId !== "string") {
      throw new Error("The comment id should be a valid string.");
    }
    if (!Validator.isUUID(commentId)) {
      throw new Error("The comment id should be a valid uuid.");
    }

    await this.commentModel.delete(commentId);
  }
}

export default DeleteCommentController;
