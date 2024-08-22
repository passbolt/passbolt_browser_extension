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
 * @since         4.10.0
 */

import {ownerPermissionDto} from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity.test.data";
import FolderEntity from "../../../model/entity/folder/folderEntity";
import PermissionChangesCollection from "../../../model/entity/permission/change/permissionChangesCollection";
import {defaultFolderDto} from "passbolt-styleguide/src/shared/models/entity/folder/folderEntity.test.data";

export const permission = ownerPermissionDto({aco: "Folder", aco_foreign_key: "f848277c-5398-58f8-a82a-72397af2d450"});

export function folderDto() {
  return defaultFolderDto({
    id: "f848277c-5398-58f8-a82a-72397af2d450",
    name: "Test",
    folder_parent_id: null,
    permission: permission,
    permissions: [permission]
  });
}

export function folderModelMock(data = {}) {
  return {
    findForShare: () => new FolderEntity(folderDto()),
    ...data
  };
}


export function resourceModelMock(data = {}) {
  return {
    calculatePermissionsChangesForCreate: () =>  new PermissionChangesCollection([
      permission
    ]),
    updateLocalStorage: jest.fn(),
    ...data
  };
}

export function shareModelMock(data = {}) {
  return {
    bulkShareResources: () => jest.fn(),
    ...data
  };
}
