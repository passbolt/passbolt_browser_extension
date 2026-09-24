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
 * @since         5.16.0
 */
import { defaultFolderDto } from "passbolt-styleguide/src/shared/models/entity/folder/folderEntity.test.data";
import {
  ownerPermissionDto,
  readPermissionDto,
} from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity.test.data";
import PermissionEntity from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity";

/**
 * A folder DTO carrying an owner or read permission, for the given id and parent.
 * @param {string} id The folder id.
 * @param {string|null} folderParentId The parent folder id, or null for the root.
 * @param {boolean} isOwner Whether the operator owns the folder.
 * @returns {object}
 */
export const folderWithOwnershipDto = (id, folderParentId, isOwner) =>
  defaultFolderDto({
    id,
    folder_parent_id: folderParentId,
    permission: isOwner
      ? ownerPermissionDto({ aco: PermissionEntity.ACO_FOLDER, aco_foreign_key: id })
      : readPermissionDto({ aco: PermissionEntity.ACO_FOLDER, aco_foreign_key: id }),
  });
