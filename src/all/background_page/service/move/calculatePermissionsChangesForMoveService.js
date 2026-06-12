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
import PermissionChangesCollection from "../../model/entity/permission/change/permissionChangesCollection";
import PermissionEntity from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity";
import PermissionsCollection from "passbolt-styleguide/src/shared/models/entity/permission/permissionsCollection";

class CalculatePermissionsChangesForMoveService {
  /**
   * Calculate permission changes when a folder moves from parentFolder to destFolder.
   * From current permissions, remove the parent folder permissions, add the destination permissions.
   * From this new set of permissions and the original permissions, calculate the needed changes.
   *
   * NOTE: This function requires permissions to be set for all objects.
   *
   * @param {FolderEntity} folderEntity
   * @param {(FolderEntity|null)} parentFolder
   * @param {(FolderEntity|null)} destFolder
   * @returns {PermissionChangesCollection}
   */
  static forFolder(folderEntity, parentFolder, destFolder) {
    return CalculatePermissionsChangesForMoveService._calculate(
      folderEntity,
      parentFolder,
      destFolder,
      PermissionEntity.ACO_FOLDER,
    );
  }

  /**
   * Calculate permission changes when a resource moves from parentFolder to destFolder.
   * From current permissions, remove the parent folder permissions, add the destination permissions.
   * From this new set of permissions and the original permissions, calculate the needed changes.
   *
   * NOTE: This function requires permissions to be set for all objects.
   *
   * @param {ResourceEntity} resource
   * @param {(FolderEntity|null)} parentFolder
   * @param {(FolderEntity|null)} destFolder
   * @returns {PermissionChangesCollection}
   */
  static forResource(resource, parentFolder, destFolder) {
    return CalculatePermissionsChangesForMoveService._calculate(
      resource,
      parentFolder,
      destFolder,
      PermissionEntity.ACO_RESOURCE,
    );
  }

  /**
   * Shared permission-change calculation for `forFolder` and `forResource`.
   * Removes the parent folder permissions from the entity, adds the destination folder permissions,
   * and returns the changes against the entity's original permissions. When moving to the root,
   * the highest permission on the entity is preserved.
   *
   * @param {FolderEntity|ResourceEntity} entity The folder or resource being moved.
   * @param {(FolderEntity|null)} parentFolder The current parent folder, or null if moving from the root.
   * @param {(FolderEntity|null)} destFolder The destination folder, or null if moving to the root.
   * @param {string} aco One of `PermissionEntity.ACO_FOLDER` or `PermissionEntity.ACO_RESOURCE`; not exposed on the public callers, which hardcode the value matching the entity type.
   * @returns {PermissionChangesCollection}
   * @private
   */
  static _calculate(entity, parentFolder, destFolder, aco) {
    let remainingPermissions = new PermissionsCollection([], { assertAtLeastOneOwner: false });

    // Remove permissions from parent if any
    if (parentFolder) {
      if (!entity.permissions || !parentFolder.permissions) {
        throw new TypeError("CalculatePermissionsChangesForMoveService requires permissions to be set.");
      }
      remainingPermissions = PermissionsCollection.diff(entity.permissions, parentFolder.permissions, false);
    }
    // Add destination permissions
    let permissionsFromParent = new PermissionsCollection([], { assertAtLeastOneOwner: false });
    if (destFolder) {
      if (!destFolder.permissions) {
        throw new TypeError("CalculatePermissionsChangesForMoveService requires destination permissions to be set.");
      }
      permissionsFromParent = destFolder.permissions.cloneForAco(aco, entity.id, false);
    }

    const newPermissions = PermissionsCollection.sum(remainingPermissions, permissionsFromParent, false);
    if (!destFolder) {
      /*
       * If the move is toward the root, reuse highest permission.
       */
      newPermissions.addOrReplace(
        new PermissionEntity({
          aco: aco,
          aco_foreign_key: entity.id,
          aro: entity.permission.aro,
          aro_foreign_key: entity.permission.aroForeignKey,
          type: PermissionEntity.PERMISSION_OWNER,
        }),
      );
    }
    newPermissions.assertAtLeastOneOwner();
    return PermissionChangesCollection.calculateChanges(entity.permissions, newPermissions);
  }
}

export default CalculatePermissionsChangesForMoveService;
