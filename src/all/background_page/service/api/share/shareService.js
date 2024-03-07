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

const SHARE_SERVICE_RESOURCE_NAME = 'share';

class ShareService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, ShareService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return SHARE_SERVICE_RESOURCE_NAME;
  }

  /**
   * Update a given folder permission
   *
   * @param {string} folderId uuid
   * @param {object} permissionChangesDto
   * @returns {Promise<*>}
   * @throws {TypeError} if folder id is not a uuid or permission changes is empty
   * @public
   */
  async shareFolder(folderId, permissionChangesDto) {
    this.assertValidId(folderId);
    this.assertNonEmptyData(permissionChangesDto);
    const url = `folder/${folderId}`;
    const response = await this.apiClient.update(url, permissionChangesDto);
    return response.body;
  }

  /**
   * Simulate share permissions update.
   *
   * It is helpful to :
   *  - Ensure that the changes won't compromise the data integrity;
   *  - Get the lists of added and removed users (Used for later encryption).
   *
   * @param resourceId
   * @param permissions
   * @returns {*}
   */
  async simulateShareResource(resourceId, permissions) {
    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/simulate/resource/${resourceId}`, {});
    const body = this.apiClient.buildBody({permissions: permissions});
    const response = await this.apiClient.fetchAndHandleResponse('POST', url, body);
    return response.body;
  }

  /**
   * Share a resource
   * @param {string} resourceId The resource id to share
   * @param {object} data The request body data
   * @returns {*}
   */
  async shareResource(resourceId, data) {
    this.assertValidId(resourceId);
    this.assertNonEmptyData(data);
    const url = `resource/${resourceId}`;
    const response = await this.apiClient.update(url, data);
    return response.body;
  }
}

export default ShareService;
