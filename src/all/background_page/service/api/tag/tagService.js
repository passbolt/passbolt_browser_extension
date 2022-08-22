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
 */
import AbstractService from "../abstract/abstractService";

const FOLDER_SERVICE_RESOURCE_NAME = 'tags';

class TagService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, TagService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return FOLDER_SERVICE_RESOURCE_NAME;
  }

  /**
   * Find all tags
   *
   * @returns {Promise<*>} response body
   * @throws {TypeError} if urlOptions key or values are not a string
   * @throws {PassboltServiceUnavailableError} if service is not reachable
   * @throws {PassboltBadResponseError} if passbolt API responded with non parsable JSON
   * @throws {PassboltApiFetchError} if passbolt API response is not OK (non 2xx status)
   * @public
   */
  async findAll() {
    const response = await this.apiClient.findAll();
    if (!response.body || !response.body.length) {
      return [];
    }
    return response.body;
  }

  /**
   * Add a tag to a resource using Passbolt API
   *
   * @param {string} resourceId uuid
   * @param {Object} tagsDto tag dto
   * @returns {Promise<*>} Response body
   * @public
   */
  async updateResourceTags(resourceId, tagsDto) {
    this.assertValidId(resourceId);
    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/${resourceId}`);
    const data = {
      'Tags': tagsDto.map(tag => tag.slug) // @deprecated since v3 should be 'tags'
    };
    const bodyString = this.apiClient.buildBody(data);
    const response = await this.apiClient.fetchAndHandleResponse('POST', url, bodyString);
    return response.body;
  }

  /**
   * Update a tag using Passbolt API
   *
   * @param {String} tagId uuid
   * @param {Object} tagData
   * @returns {Promise<*>} Response body
   * @throw {TypeError} if tagId is not a valid uuid
   * @public
   */
  async update(tagId, tagData) {
    this.assertValidId(tagId);
    const response = await this.apiClient.update(tagId, tagData);
    return response.body;
  }

  /**
   * Delete a tag using Passbolt API
   *
   * @param {string} tagId uuid
   * @returns {Promise<*>} Response body
   * @throw {TypeError} if tagId is not a valid uuid
   * @public
   */
  async delete(tagId) {
    this.assertValidId(tagId);
    const response = await this.apiClient.delete(tagId);
    return response.body;
  }
}

export default TagService;
