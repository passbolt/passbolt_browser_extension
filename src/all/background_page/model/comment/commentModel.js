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
import CommentEntity from "../entity/comment/commentEntity";
import CommentsCollection from "../entity/comment/commentsCollection";
import CommentService from "../../service/api/comment/commentService";

class CommentModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.commentService = new CommentService(apiClientOptions);
  }

  /**
   * Get all comments from API and map API result to comment Entity
   *
   * @param {string} resourceId uuid of the resource
   * @throws {Error} if API call fails, service unreachable, etc.
   * @return {CommentsCollection}
   */
  async findAllByResourceId(resourceId) {
    const foreignKey = 'Resource';
    const commentsDtos = await this.commentService.findAll(foreignKey, resourceId, {creator: true, modifier: false});
    return new CommentsCollection(commentsDtos);
  }

  /**
   * Create a comment using Passbolt API
   *
   * @param {CommentEntity} commentEntity
   * @returns {Promise<CommentEntity>}
   */
  async create(commentEntity) {
    const commentDto = await this.commentService.create(commentEntity.toDto({creator: false, modifier: false}));
    return new CommentEntity(commentDto);
  }

  /**
   * Delete a comment using Passbolt API
   *
   * @param {string} commentId uuid
   * @returns {Promise<void>}
   */
  async delete(commentId) {
    await this.commentService.delete(commentId);
  }
}

export default CommentModel;
