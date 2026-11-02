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
import PermissionChangeEntity from "../../model/entity/permission/change/permissionChangeEntity";
import PermissionEntity from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity";
import PermissionsCollection from "passbolt-styleguide/src/shared/models/entity/permission/permissionsCollection";

/**
 * Calculates the permission changes a move or a share applies.
 * Two families of methods: the `WithTargetPermissions` ones set an item to exactly the permissions
 * the operator confirmed, the `WithCascadedChange` ones copy a folder's own change onto its content.
 */
class CalculatePermissionsChangesService {
  /**
   * The changes giving the resource exactly the permissions the operator confirmed, lowerings and
   * removals included.
   * @param {ResourceEntity} resource The resource being moved.
   * @param {PermissionsCollection} targetPermissions The permissions the operator confirmed.
   * @returns {PermissionChangesCollection}
   */
  static forResourceWithTargetPermissions(resource, targetPermissions) {
    return CalculatePermissionsChangesService._calculateAuthoritative(
      resource,
      targetPermissions,
      PermissionEntity.ACO_RESOURCE,
    );
  }

  /**
   * The changes giving the folder exactly the permissions the operator confirmed, lowerings and
   * removals included. Only the folder itself; its content goes through forFolderWithCascadedChange.
   * @param {FolderEntity} folder The folder being moved.
   * @param {PermissionsCollection} targetPermissions The permissions the operator confirmed.
   * @returns {PermissionChangesCollection}
   */
  static forFolderWithTargetPermissions(folder, targetPermissions) {
    return CalculatePermissionsChangesService._calculateAuthoritative(
      folder,
      targetPermissions,
      PermissionEntity.ACO_FOLDER,
    );
  }

  /**
   * Copy the change made on a folder onto one item it contains: whoever it added, raised, lowered or
   * removed gets the same treatment, everybody else keeps what the item already gives them.
   * @param {FolderEntity} folderEntity
   * @param {PermissionChangesCollection} folderPermissionChanges The change made on the folder.
   * @returns {PermissionChangesCollection}
   */
  static forFolderWithCascadedChange(folderEntity, folderPermissionChanges) {
    return CalculatePermissionsChangesService._calculateCascaded(
      folderEntity,
      folderPermissionChanges,
      PermissionEntity.ACO_FOLDER,
    );
  }

  /**
   * @see forFolderWithCascadedChange, applied to a resource.
   * @param {ResourceEntity} resource
   * @param {PermissionChangesCollection} folderPermissionChanges The change made on the parent folder.
   * @returns {PermissionChangesCollection}
   */
  static forResourceWithCascadedChange(resource, folderPermissionChanges) {
    return CalculatePermissionsChangesService._calculateCascaded(
      resource,
      folderPermissionChanges,
      PermissionEntity.ACO_RESOURCE,
    );
  }

  /**
   * Build the access list the item ends up with, then derive the changes. An item the copy would
   * leave with no permission or no owner keeps what it has, and the rest of the cascade goes on.
   * @param {FolderEntity|ResourceEntity} entity The item the change is copied onto.
   * @param {PermissionChangesCollection} folderPermissionChanges The change made on the folder.
   * @param {string} aco One of `PermissionEntity.ACO_FOLDER` or `PermissionEntity.ACO_RESOURCE`.
   * @returns {PermissionChangesCollection} Empty when the item is left alone.
   * @private
   */
  static _calculateCascaded(entity, folderPermissionChanges, aco) {
    if (!entity.permissions) {
      throw new TypeError("CalculatePermissionsChangesService requires permissions to be set.");
    }
    const resultingPermissionDtos = [];
    for (const permission of entity.permissions) {
      const change = folderPermissionChanges.items.find(
        (item) => item.aro === permission.aro && item.aroForeignKey === permission.aroForeignKey,
      );
      if (!change) {
        // Untouched on the folder, so left as it is here.
        resultingPermissionDtos.push(permission.toDto());
      } else if (change.scenario !== PermissionChangeEntity.PERMISSION_CHANGE_DELETE) {
        // Touched on the folder: set to the level it now gives. A removal skips both branches,
        // which drops the permission from the resulting list.
        resultingPermissionDtos.push({ ...permission.toDto(), type: change.type });
      }
    }
    for (const change of folderPermissionChanges) {
      // Only a brand new grant reaches someone the item did not have.
      if (
        change.scenario === PermissionChangeEntity.PERMISSION_CHANGE_CREATE &&
        !entity.permissions.getByAro(change.aro, change.aroForeignKey)
      ) {
        resultingPermissionDtos.push({
          aco: aco,
          aco_foreign_key: entity.id,
          aro: change.aro,
          aro_foreign_key: change.aroForeignKey,
          type: change.type,
        });
      }
    }
    /*
     * An item left unmanageable, with nothing on it or with nobody as owner, is left alone rather
     * than blocking the operation.
     *
     * @todo Interim behaviour: the operation reports success while that item silently kept its
     * former access list. Telling the operator means computing the cascade before the confirmation.
     */
    if (!resultingPermissionDtos.some((dto) => dto.type === PermissionEntity.PERMISSION_OWNER)) {
      return new PermissionChangesCollection([]);
    }
    // The collection is built once complete, so it is validated as a whole, one owner included.
    return PermissionChangesCollection.calculateChanges(
      entity.permissions,
      new PermissionsCollection(resultingPermissionDtos),
    );
  }

  /**
   * The confirmed set is the complete access list the item must end up with, so a lowering or a
   * removal goes through. It must leave somebody as owner, checked before any change is derived.
   * @param {FolderEntity|ResourceEntity} entity The folder or resource being moved.
   * @param {PermissionsCollection} targetPermissions The permissions the operator confirmed.
   * @param {string} aco One of `PermissionEntity.ACO_FOLDER` or `PermissionEntity.ACO_RESOURCE`.
   * @returns {PermissionChangesCollection}
   * @private
   */
  static _calculateAuthoritative(entity, targetPermissions, aco) {
    if (!entity.permissions) {
      throw new TypeError("CalculatePermissionsChangesService requires permissions to be set.");
    }
    // assertAtLeastOneOwner passes on an empty set, which would delete every permission.
    if (!targetPermissions.length) {
      throw new Error(`The confirmed permissions would leave ${entity.id} without any permission.`);
    }
    try {
      targetPermissions.assertAtLeastOneOwner();
    } catch {
      throw new Error(`The confirmed permissions would leave ${entity.id} without owner.`);
    }
    return PermissionChangesCollection.calculateChanges(
      entity.permissions,
      targetPermissions.cloneForAco(aco, entity.id, false),
    );
  }
}

export default CalculatePermissionsChangesService;
