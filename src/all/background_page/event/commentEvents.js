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
 * @since         3.0.0
 */

import CreateCommentController from "../controller/comment/createCommentController";
import DeleteCommentController from "../controller/comment/deleteCommentController";
import GetCommentsByRessourceController from "../controller/comment/getCommentsByRessourceIdController";
import User from "../model/user";
const listen = function(worker) {
  /*
   * ================================
   * SERVICE ACTIONS
   * ================================
   */
  /*
   * Create a new comment
   *
   * @listens passbolt.comments.find-all-by-resource
   * @param requestId {uuid} The request identifier
   * @param resourceId {string} the resource uuid
   */
  worker.port.on('passbolt.comments.find-all-by-resource', async(requestId, resourceId) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new GetCommentsByRessourceController(worker, requestId, apiClientOptions);
    await controller._exec(resourceId);
  });

  /*
   * Create a new comment
   *
   *
   * @listens passbolt.comments.create
   * @param requestId {uuid} The request identifier
   * @param commentDto {object} The comment
   */
  worker.port.on('passbolt.comments.create', async(requestId, commentDto) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new CreateCommentController(worker, requestId, apiClientOptions);
    await controller._exec(commentDto);
  });

  /*
   * delete a comment
   *
   * @listens passbolt.comments.delete
   * @param requestId {uuid} The request identifier
   * @param comment {array} The comment
   */
  worker.port.on('passbolt.comments.delete', async(requestId, commentId) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new DeleteCommentController(worker, requestId, apiClientOptions);
    await controller._exec(commentId);
  });
};

export const CommentEvents = {listen};
