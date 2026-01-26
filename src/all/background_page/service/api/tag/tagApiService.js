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
import PassboltResponseEntity from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity";
import AbstractService from "../abstract/abstractService";
import { assertArray } from "../../../utils/assertions";

export const TAG_API_SERVICE_RESOURCE_NAME = "tags";

class TagApiService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, TagApiService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return TAG_API_SERVICE_RESOURCE_NAME;
  }

  /**
   * Find all tags
   *
   * @returns {Promise<PassboltResponseEntity>} Response
   * @throws {PassboltServiceUnavailableError} if service is not reachable
   * @throws {PassboltBadResponseError} if passbolt API responded with non parsable JSON
   * @throws {PassboltApiFetchError} if passbolt API response is not OK (non 2xx status)
   * @public
   */
  async findAll() {
    const response = await this.apiClient.findAll();
    return new PassboltResponseEntity(response);
  }

  /**
   * Update the resource's tag collection using Passbolt API
   *
   * @param {string} resourceId uuid
   * @param {Array<Object>} tagsDto tag dto
   * @returns {Promise<PassboltResponseEntity>} Response
   * @throws {TypeError} if resourceId is not an uuid or if tagsDto is not an array
   * @throws {PassboltServiceUnavailableError} if service is not reachable
   * @throws {PassboltBadResponseError} if passbolt API responded with non parsable JSON
   * @throws {PassboltApiFetchError} if passbolt API response is not OK (non 2xx status)
   * @public
   */
  async updateResourceTags(resourceId, tagsDto) {
    this.assertValidId(resourceId);
    assertArray(tagsDto);

    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/${resourceId}`);
    const data = {
      tags: tagsDto.map((tag) => tag.slug),
    };
    const bodyString = this.apiClient.buildBody(data);

    const response = await this.apiClient.fetchAndHandleResponse("POST", url, bodyString);
    return new PassboltResponseEntity(response);
  }

  /**
   * Update a tag using Passbolt API
   *
   * @param {String} tagId uuid
   * @param {Object} tagData
   * @returns {Promise<PassboltResponseEntity>} Response
   * @throws {TypeError} if tagId is not a valid uuid
   * @throws {PassboltServiceUnavailableError} if service is not reachable
   * @throws {PassboltBadResponseError} if passbolt API responded with non parsable JSON
   * @throws {PassboltApiFetchError} if passbolt API response is not OK (non 2xx status)
   * @public
   */
  async update(tagId, tagData) {
    this.assertValidId(tagId);

    const response = await this.apiClient.update(tagId, tagData);
    return new PassboltResponseEntity(response);
  }

  /**
   * Delete a tag using Passbolt API
   *
   * @param {string} tagId uuid
   * @returns {Promise<PassboltResponseEntity>} Response
   * @throws {TypeError} if tagId is not a valid uuid
   * @throws {PassboltServiceUnavailableError} if service is not reachable
   * @throws {PassboltBadResponseError} if passbolt API responded with non parsable JSON
   * @throws {PassboltApiFetchError} if passbolt API response is not OK (non 2xx status)
   * @public
   */
  async delete(tagId) {
    this.assertValidId(tagId);

    const response = await this.apiClient.delete(tagId);
    return new PassboltResponseEntity(response);
  }
}

export default TagApiService;
