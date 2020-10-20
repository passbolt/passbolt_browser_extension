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
const {CommentEntity} = require('../model/entity/comment/commentEntity');
const {CommentModel} = require('../model/comment/commentModel');
const {User} = require('../model/user');

const listen = function (worker) {

  // ================================
  // SERVICE ACTIONS
  // ================================
  /*
   * Create a new comment
   *
   * @listens passbolt.comments.find-all-by-resource
   * @param requestId {uuid} The request identifier
   * @param resourceId {string} the resource uuid
   */
  worker.port.on('passbolt.comments.find-all-by-resource', async function (requestId, resourceId) {
    try {
      const clientOptions = await User.getInstance().getApiClientOptions();
      const commentModel = new CommentModel(clientOptions);
      const commentsCollection = await commentModel.findAllByResourceId(resourceId);
      worker.port.emit(requestId, 'SUCCESS', commentsCollection);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Create a new comment
   *
   * @listens passbolt.comments.create
   * @param requestId {uuid} The request identifier
   * @param commentDto {object} The comment
   */
  worker.port.on('passbolt.comments.create', async function (requestId, commentDto) {
    try {
      const clientOptions = await User.getInstance().getApiClientOptions();
      const commentModel = new CommentModel(clientOptions);
      const commentEntity = await commentModel.create(new CommentEntity(commentDto));
      worker.port.emit(requestId, 'SUCCESS', commentEntity);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * delete a comment
   *
   * @listens passbolt.comments.delete
   * @param requestId {uuid} The request identifier
   * @param comment {array} The comment
   */
  worker.port.on('passbolt.comments.delete', async function (requestId, commentId) {
    try {
      const apiClientOptions = await User.getInstance().getApiClientOptions();
      const commentModel = new CommentModel(apiClientOptions);
      await commentModel.delete(commentId);
      worker.port.emit(requestId, 'SUCCESS', commentId);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });
};

exports.listen = listen;
