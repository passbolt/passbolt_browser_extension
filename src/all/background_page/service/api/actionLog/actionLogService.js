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
import AbstractActionLogEntity from "../../../model/entity/actionLog/abstractActionLogEntity";
import AbstractService from "../abstract/abstractService";

const RESOURCE_SERVICE_RESOURCE_NAME = 'actionlog';

class ActionLogService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, ActionLogService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return RESOURCE_SERVICE_RESOURCE_NAME;
  }

  /**
   * Return the list of supported options for the contains option in API find operations
   *
   * @returns {Array<string>} list of supported option
   */
  static getSupportedContainOptions() {
    return [];
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
   * Find all action logs for a foreign model
   *
   * @param {string} foreignModel The target foreign model example: resource
   * @param {string} foreignId The target foreign instance
   * @param {int} page The page to retrieve
   * @param {int} limit The limit of elements by page
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async findAllFor(foreignModel, foreignId, page, limit) {
    this.assertValidForeignModel(foreignModel);
    this.assertValidId(foreignId);
    if (!page || typeof page !== 'number') {
      throw new TypeError(`ActionLog page should be a valid integer.`);
    }
    if (!limit || typeof limit !== 'number') {
      throw new TypeError(`ActionLog limit should be a valid integer.`);
    }

    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/${foreignModel.toLowerCase()}/${foreignId}`);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('limit', limit.toString());
    const response = await this.apiClient.fetchAndHandleResponse('GET', url);
    if (!response.body || !response.body.length) {
      return [];
    }
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
      throw new TypeError(`ActionLog foreign model should be a valid string.`);
    }
    if (!AbstractActionLogEntity.ALLOWED_FOREIGN_MODELS.includes(foreignModel)) {
      throw new TypeError(`ActionLog foreign model ${foreignModel} in not in the list of supported models.`);
    }
  }
}

export default ActionLogService;
