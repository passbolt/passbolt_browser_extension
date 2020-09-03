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
const {AbstractService} = require('../abstract/abstractService');
const {CommentEntity} = require('../../../model/entity/comment/commentEntity');

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
   * Return the list of supported filters for in API find operations
   *
   * @returns {Array<string>} list of supported option
   */
  static getSupportedFiltersOptions() {
    return [];
  }

  /**
   * Return the list of supported orders for in API find operations
   *
   * @returns {Array<string>} list of supported option
   */
  static getSupportedOrdersOptions() {
    return [];
  }

  /**
   * Find all resources
   *
   * @param {string} foreignId foreign model name
   * @param {string} foreignModel foreign key uuid
   * @param {Object} [contains] optional example: {creator: true}
   * @param {Object} [filters] optional
   * @param {Object} [orders] optional
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async findAll(foreignModel, foreignId,  contains, filters, orders) {
    this.apiClient.assertValidId(foreignId);
    this.assertValidForeignModel(foreignModel);

    contains = contains ? this.formatContainOptions(contains, CommentService.getSupportedContainOptions()) : null;
    filters = filters ? this.formatFilterOptions(filters, CommentService.getSupportedFiltersOptions()) : null;
    orders = orders ? this.formatOrderOptions(orders, CommentService.getSupportedFiltersOptions()) : null;
    const urlOptions = {...contains, ...filters, ...orders};

    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/${foreignModel.toLowerCase()}/${foreignId}`, urlOptions || {});
    const response = await this.apiClient.fetchAndHandleResponse('GET', url);
    if (!response.body || !response.body.length) {
      return [];
    }
    return response.body;
  }

  /**
   * Create a resource using Passbolt API
   *
   * @param {Object} commentDto
   * @param {Object} [contains] optional example: {creator: true}
   * @returns {Promise<*>} Response body
   * @public
   */
  async create(commentDto, contains) {
    let urlOptions = contains ? this.formatContainOptions(contains, CommentService.getSupportedContainOptions()) : null;

    const foreignModel = commentDto.foreign_model;
    const foreignId = commentDto.foreign_key;
    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/${foreignModel.toLowerCase()}/${foreignId}`, urlOptions || {});
    const data = {content: commentDto.content};
    if (commentDto.parent_id) {
      data.parent_id = commentDto.parent_id;
    }

    const bodyString = this.apiClient.buildBody(data);
    const response = await this.apiClient.fetchAndHandleResponse('POST', url, bodyString);
    return response.body;
  }

  /**
   * Delete a resource using Passbolt API
   *
   * @param {string} resourceId uuid
   * @returns {Promise<*>} Response body
   * @public
   */
  async delete(resourceId) {
    const response = await this.apiClient.delete(resourceId);
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

exports.CommentService = CommentService;
