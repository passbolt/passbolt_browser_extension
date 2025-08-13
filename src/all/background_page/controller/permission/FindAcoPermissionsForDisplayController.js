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
import PermissionEntity from "../../model/entity/permission/permissionEntity";
import FindFoldersService from "../../service/folder/findFoldersService";
import {assertString, assertUuid} from "../../utils/assertions";

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
    this.findFolderService = new FindFoldersService(apiClientOptions);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @param {string} acoId The aco id.
   * @param {string} acoType The aco type.
   * @return {Promise<void>}
   */
  async _exec(acoId, acoType) {
    try {
      const result = await this.exec(acoId, acoType);
      this.worker.port.emit(this.requestId, "SUCCESS", result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Find all permissions from an aco id (Resource or Folder).
   *
   * @param {string} acoId The aco id.
   * @param {string} acoType The aco type.
   * @return {Promise<PermissionsCollection>}
   */
  async exec(acoId, acoType) {
    // Assert parameters
    assertUuid(acoId);
    assertString(acoType);

    if (acoType === PermissionEntity.ACO_RESOURCE) {
      return this.findPermissionService.findAllByAcoForeignKeyForDisplay(acoId);
    } else if (acoType === PermissionEntity.ACO_FOLDER) {
      // TODO: Should be adapted when API V5 can return permissions with folder id to use the same service than resources
      const folderEntity = await this.findFolderService.findByIdWithPermissions(acoId);
      folderEntity.permissions.sort();
      return folderEntity.permissions;
    }
  }
}

export default FindAcoPermissionsForDisplayController;
