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
import CommentEntity from "../../model/entity/comment/commentEntity";

class CreateCommentController {
  /**
   * CreateCommentController constructor
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
  async _exec(commentDto) {
    try {
      const result = await this.exec(commentDto);
      this.worker.port.emit(this.requestId, "SUCCESS", result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Create a new comment
   *
   * @param commentDto {object} The comment to create
   * @return {Promise<CommentEntity>} The created comment.
   */
  async exec(commentDto) {
    return this.commentModel.create(new CommentEntity(commentDto));
  }
}

export default CreateCommentController;
