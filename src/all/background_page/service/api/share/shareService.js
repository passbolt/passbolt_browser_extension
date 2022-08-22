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
}

export default ShareService;
