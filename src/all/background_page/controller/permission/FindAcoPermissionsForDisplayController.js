/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.9.4
 */
import FindPermissionsService from "../../service/permission/findPermissionsService";

class FindAcoPermissionsForDisplayController {
  /**
   * FindAcoPermissionsForDisplayController constructor
   *
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions The api client options
   * @param {AccountEntity} account The account associated to the worker.
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;

    // Service
    this.findPermissionService = new FindPermissionsService(account, apiClientOptions);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @param {string} resourceId The resource id.
   * @return {Promise<void>}
   */
  async _exec(resourceId) {
    try {
      const result = await this.exec(resourceId);
      this.worker.port.emit(this.requestId, "SUCCESS", result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Find all permissions from a resource id.
   *
   * @param {string} resourceId The resource id.
   * @return {Promise<PermissionsCollection>}
   */
  async exec(resourceId) {
    return this.findPermissionService.findAllByAcoForeignKeyForDisplay(resourceId);
  }
}

export default FindAcoPermissionsForDisplayController;
