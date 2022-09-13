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
import CommentEntity from "../../../model/entity/comment/commentEntity";
import AbstractService from "../abstract/abstractService";


const COMMENT_SERVICE_RESOURCE_NAME = 'comments';

class CommentService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, CommentService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return COMMENT_SERVICE_RESOURCE_NAME;
  }

  /**
   * Return the list of supported options for the contains option in API find operations
   *
   * @returns {Array<string>} list of supported option
   */
  static getSupportedContainOptions() {
    return ['creator', 'modifier'];
  }

  /**
   * Find all comments
   *
   * @param {string} foreignId foreign model name
   * @param {string} foreignModel foreign key uuid
   * @param {Object} [contains] optional example: {creator: true}
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async findAll(foreignModel, foreignId,  contains) {
    this.assertValidId(foreignId);
    this.assertValidForeignModel(foreignModel);

    contains = contains ? this.formatContainOptions(contains, CommentService.getSupportedContainOptions()) : null;
    const urlOptions = {...contains};

    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/${foreignModel.toLowerCase()}/${foreignId}`, urlOptions || {});
    const response = await this.apiClient.fetchAndHandleResponse('GET', url);
    if (!response.body || !response.body.length) {
      return [];
    }
    return response.body;
  }

  /**
   * Create a comment using Passbolt API
   *
   * @param {Object} commentDto
   * @returns {Promise<*>} Response body
   * @throw {TypeError} if comment dto is invalid or incomplete
   * @public
   */
  async create(commentDto) {
    if (!commentDto || !commentDto.foreign_key || !commentDto.foreign_model) {
      throw new TypeError(`Comment creation failed, invalid comment data.`);
    }
    const foreignModel = commentDto.foreign_model;
    this.assertValidForeignModel(foreignModel);
    const foreignId = commentDto.foreign_key;
    this.assertValidId(foreignId);

    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/${foreignModel.toLowerCase()}/${foreignId}`, {});
    const data = {content: commentDto.content};
    if (commentDto.parent_id) {
      data.parent_id = commentDto.parent_id;
    }

    const bodyString = this.apiClient.buildBody(data);
    const response = await this.apiClient.fetchAndHandleResponse('POST', url, bodyString);
    return response.body;
  }

  /**
   * Delete a comment using Passbolt API
   *
   * @param {string} commentId uuid
   * @returns {Promise<*>} Response body
   * @throws {TypeError} if commenId is not a valid uuid
   * @public
   */
  async delete(commentId) {
    this.assertValidId(commentId);
    const response = await this.apiClient.delete(commentId);
    return response.body;
  }

  /**
   * Assert a foreign model name is supported by the API
   *
   * @param {string} foreignModel for example 'Resource'
   * @throw {TypeError} if the name is not a valid string or is not supported
   * @public
   */
  assertValidForeignModel(foreignModel) {
    if (!foreignModel || typeof foreignModel !== 'string') {
      throw new TypeError(`Comment foreign model should be a valid string.`);
    }
    if (!CommentEntity.ALLOWED_FOREIGN_MODELS.includes(foreignModel)) {
      throw new TypeError(`Comment foreign model ${foreignModel} in not in the list of supported models.`);
    }
  }
}

export default CommentService;
