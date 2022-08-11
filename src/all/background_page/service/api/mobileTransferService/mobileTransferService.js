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

const MOBILE_TRANSFER_SERVICE_RESOURCE_NAME = 'mobile/transfers';

class MobileTransferService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, MobileTransferService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return MOBILE_TRANSFER_SERVICE_RESOURCE_NAME;
  }

  /**
   * Get transfer info
   *
   * @param {string} transferId transfer uuid
   * @throws {Error} if API call fails, service unreachable, etc
   * @throws {TypeError} if transfer id is not a uuid
   * @returns {Object} transferDto
   * @public
   */
  async get(transferId) {
    this.assertValidId(transferId);
    const response = await this.apiClient.get(transferId);
    return response.body;
  }

  /**
   * Create a transfer using Passbolt API
   *
   * @param {Object} transferDto
   * @returns {Promise<*>} Response body
   * @throws {TypeError} if data is empty
   * @public
   */
  async create(transferDto) {
    this.assertNonEmptyData(transferDto);
    const response = await this.apiClient.create(transferDto);
    return response.body;
  }

  /**
   * Update a transfer using Passbolt API
   *
   * @param {String} transferId uuid
   * @param {Object} transferDto
   * @returns {Promise<*>} Response body
   * @throws {TypeError} if transfer id is not a uuid or data is empty
   * @public
   */
  async update(transferId, transferDto) {
    this.assertValidId(transferId);
    this.assertNonEmptyData(transferDto);
    const response = await this.apiClient.update(transferId, transferDto);
    return response.body;
  }
}

export default MobileTransferService;
