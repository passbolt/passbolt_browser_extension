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
import AbstractService from "../abstract/abstractService";
import FavoriteEntity from "../../../model/entity/favorite/favoriteEntity";

const FAVORITE_SERVICE_RESOURCE_NAME = 'favorites';

class FavoriteService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, FavoriteService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return FAVORITE_SERVICE_RESOURCE_NAME;
  }

  /**
   * Add a favorite using Passbolt API
   *
   * @param {string} foreignModel
   * @param {string} foreignId uuid
   * @returns {Promise<*>} Response body
   * @throw {TypeError} if foreign model or id are not valid
   * @public
   */
  async create(foreignModel, foreignId) {
    this.assertValidForeignModel(foreignModel);
    this.assertValidId(foreignId);
    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/${foreignModel.toLowerCase()}/${foreignId}`, {});
    const response = await this.apiClient.fetchAndHandleResponse('POST', url);
    return response.body;
  }

  /**
   * Delete a resource using Passbolt API
   *
   * @param {string} favoriteId uuid
   * @throws {TypeError} if id is not valid uuid
   * @returns {Promise<*>} Response body
   * @public
   */
  async delete(favoriteId) {
    this.assertValidId(favoriteId);
    const response = await this.apiClient.delete(favoriteId);
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
      throw new TypeError(`Favorite foreign model should be a valid string.`);
    }
    if (!FavoriteEntity.ALLOWED_FOREIGN_MODELS.includes(foreignModel)) {
      throw new TypeError(`Favorite foreign model ${foreignModel} in not in the list of supported models.`);
    }
  }
}

export default FavoriteService;
