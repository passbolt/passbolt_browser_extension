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
 * @since         4.9.4
 */
import {assertUuid} from "../../utils/assertions";
import FindFoldersService from "../../service/folder/findFoldersService";

class FindFolderDetailsController {
  /**
   * Constructor.
   * @param {Worker} worker The associated worker.
   * @param {string} requestId The associated request id.
   * @param {ApiClientOptions} apiClientOptions The api client options.
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.findFolderService = new FindFoldersService(apiClientOptions);
  }

  /**
   * Controller executor.
   * @param {string} folderId The folder id
   * @returns {Promise<void>}
   */
  async _exec(folderId) {
    try {
      const result = await this.exec(folderId);
      this.worker.port.emit(this.requestId, 'SUCCESS', result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Find folder with creator and modifier details.
   * @param {string} folderId
   * @returns {Promise<FolderEntity>}
   */
  async exec(folderId) {
    assertUuid(folderId);
    return this.findFolderService.findByIdWithCreatorAndModifier(folderId);
  }
}

export default FindFolderDetailsController;
