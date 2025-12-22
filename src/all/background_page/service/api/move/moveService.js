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
import { assertUuid } from "../../../utils/assertions";

const MOVE_SERVICE_RESOURCE_NAME = "move";

class MoveService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, MoveService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return MOVE_SERVICE_RESOURCE_NAME;
  }

  /**
   * Move a folder.
   *
   * @param {string} id The folder id.
   * @param {string} destinationFolderId The destination folder parent id.
   * @returns {Promise<void>}
   * @public
   */
  async moveFolder(id, destinationFolderId) {
    assertUuid(id, "The parameter 'id' should be a UUID.");
    if (destinationFolderId !== null) {
      assertUuid(destinationFolderId, "The parameter 'destinationFolderId' should be a UUID or null.");
    }

    const url = `folder/${id}`;
    const data = {
      folder_parent_id: destinationFolderId,
    };
    const response = await this.apiClient.update(url, data);
    return response.body;
  }

  /**
   * Move a resource.
   *
   * @param {string} id The resource id.
   * @param {string} destinationFolderId The destination folder parent id.
   * @returns {Promise<void>}
   * @public
   */
  async moveResource(id, destinationFolderId) {
    assertUuid(id, "The parameter 'id' should be a UUID.");
    if (destinationFolderId !== null) {
      assertUuid(destinationFolderId, "The parameter 'destinationFolderId' should be a UUID or null.");
    }

    const url = `resource/${id}`;
    const data = {
      folder_parent_id: destinationFolderId,
    };
    const response = await this.apiClient.update(url, data);
    return response.body;
  }
}

export default MoveService;
