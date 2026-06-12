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
 * @since         5.13.0
 */

import FindFoldersService from "../../service/folder/findFoldersService";
import { assertArrayUUID } from "../../utils/assertions";

class FindFoldersForShareController {
  /**
   * FindFoldersForShareController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.findFoldersService = new FindFoldersService(apiClientOptions);
  }

  /**
   * Wrapper of exec function to run it with worker.
   * @param {Array<string>} foldersIds
   * @return {Promise<void>}
   */
  async _exec(foldersIds) {
    try {
      const result = await this.exec(foldersIds);
      this.worker.port.emit(this.requestId, "SUCCESS", result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Find the folders to share with their permissions, users and groups hydrated.
   * The styleguide share dialog reads `permission.user || permission.group` on each
   * permission, so we must request the nested user.profile and group contains; the
   * generic `permissions` contain alone returns permissions without aro details.
   * @param {Array<string>} foldersIds
   * @return {Promise<FoldersCollection>}
   */
  async exec(foldersIds) {
    assertArrayUUID(foldersIds);

    const contains = {
      permission: true,
      "permissions.user.profile": true,
      "permissions.group": true,
    };
    return this.findFoldersService.findAllByIds(foldersIds, contains);
  }
}

export default FindFoldersForShareController;
