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
 * @since         4.6.0
 */
import {v4 as uuidv4} from "uuid";
import {users} from "passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data";
import {defaultFolderDto} from "passbolt-styleguide/src/shared/models/entity/folder/folderEntity.test.data";
import {
  ownerFolderPermissionDto
} from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity.test.data";

export const _3FoldersSharedWith3UsersResourcesDto = async() => {
  const folder1Id = uuidv4();
  const folder2Id = uuidv4();
  const folder3Id = uuidv4();

  const userAda = users.ada;
  const userAdmin = users.admin;
  const userBetty = users.betty;

  const folder1PermissionOwner = ownerFolderPermissionDto({
    aco_foreign_key: folder1Id,
    aro_foreign_key: userAda.id,
  });

  const folder2PermissionOwner = ownerFolderPermissionDto({
    aco_foreign_key: folder2Id,
    aro_foreign_key: userAda.id,
  });

  const folder3PermissionOwner = ownerFolderPermissionDto({
    aco_foreign_key: folder3Id,
    aro_foreign_key: userAda.id,
  });

  const folder1FullPermissionAda = ownerFolderPermissionDto({
    aco_foreign_key: folder1Id,
    aro_foreign_key: userAda.id,
    user: userAda,
    group: null
  });

  const folder2FullPermissionAda = ownerFolderPermissionDto({
    aco_foreign_key: folder2Id,
    aro_foreign_key: userAda.id,
    user: userAda,
    group: null
  });

  const folder3FullPermissionAda = ownerFolderPermissionDto({
    aco_foreign_key: folder3Id,
    aro_foreign_key: userAda.id,
    user: userAda,
    group: null
  });

  const folder2FullPermissionAdmin = ownerFolderPermissionDto({
    aco_foreign_key: folder2Id,
    aro_foreign_key: userAdmin.id,
    user: userAdmin,
    group: null
  });

  const folder3FullPermissionBetty = ownerFolderPermissionDto({
    aco_foreign_key: folder3Id,
    aro_foreign_key: userBetty.id,
    user: userBetty,
    group: null
  });

  const folder1 = defaultFolderDto({
    id: folder1Id,
    permission: folder1PermissionOwner,
    permissions: [folder1FullPermissionAda],
  });

  const folder2 = defaultFolderDto({
    id: folder2Id,
    permission: folder2PermissionOwner,
    permissions: [folder2FullPermissionAda, folder2FullPermissionAdmin],
    folder_parent_id: folder1Id
  });

  const folder3 = defaultFolderDto({
    id: folder3Id,
    permission: folder3PermissionOwner,
    permissions: [folder3FullPermissionAda, folder3FullPermissionBetty],
    folder_parent_id: folder2Id
  });

  return [folder1, folder2, folder3];
};

export const createChangesFolderDto = (data = {}) => {
  const defaultData = {
    aco: "Folder",
    aco_foreign_key: uuidv4(),
    aro: "User",
    aro_foreign_key: uuidv4(),
    is_new: true,
    type: 1
  };
  return Object.assign(defaultData, data);
};
