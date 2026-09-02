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
import i18n from "../../sdk/i18n";

class CalculatePermissionsChangesService {
  /**
   * Calculate the changes that give the resource exactly the permissions the operator confirmed.
   * Lowering or removing a permission takes effect as shown.
   * The styleguide move flow already built that set, so there is nothing left to merge here.
   *
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
   * Calculate the changes that give the folder exactly the permissions the operator confirmed.
   * Lowering or removing a permission takes effect as shown.
   * Only the folder itself is handled here. What it contains is handled by MoveOneFolderService,
   * through forFolderWithCascadedChange below.
   *
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
   * Copy the change made on a folder onto one item the folder contains.
   * Someone the change added, raised, lowered or removed on the folder gets the same treatment here.
   * Everybody else keeps what the item already gives them.
   *
   * Only what the operator actually changed is copied down, never the folder's whole access list.
   * A permission the folder merely kept, unedited, must not reach an item that never had it.
   * An item the copy would leave unmanageable is left alone, see _calculateCascaded.
   *
   * Used by the move flow and by the share flow alike.
   *
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
   * Shared by forFolderWithCascadedChange and forResourceWithCascadedChange.
   * Builds the access list the item ends up with, checks it, then derives the changes.
   * An item left with no permission at all, or with nobody as owner, keeps what it has and gets no
   * change at all. The rest of the cascade still goes through.
   *
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
    const resultingPermissions = new PermissionsCollection([], { assertAtLeastOneOwner: false });
    for (const permission of entity.permissions) {
      const change = folderPermissionChanges.items.find(
        (item) => item.aro === permission.aro && item.aroForeignKey === permission.aroForeignKey,
      );
      if (!change) {
        // Untouched on the folder, so left as it is here.
        resultingPermissions.push(permission);
      } else if (change.scenario !== PermissionChangeEntity.PERMISSION_CHANGE_DELETE) {
        // Touched on the folder, so set to the level the folder now gives them.
        // A removal skips both branches, which leaves the permission out of the resulting list.
        const alignedPermission = new PermissionEntity(permission.toDto());
        alignedPermission.type = change.type;
        resultingPermissions.push(alignedPermission);
      }
    }
    for (const change of folderPermissionChanges) {
      // Only a brand new grant reaches someone the item did not have.
      // A level change only moves the people already on it.
      if (
        change.scenario === PermissionChangeEntity.PERMISSION_CHANGE_CREATE &&
        !entity.permissions.getByAro(change.aro, change.aroForeignKey)
      ) {
        resultingPermissions.push(
          new PermissionEntity({
            aco: aco,
            aco_foreign_key: entity.id,
            aro: change.aro,
            aro_foreign_key: change.aroForeignKey,
            type: change.type,
          }),
        );
      }
    }
    /*
     * An item the alignment would leave unmanageable, with nothing on it or with nobody as owner,
     * is left alone instead of blocking the whole operation. The empty case is tested separately
     * because assertAtLeastOneOwner passes on an empty collection.
     *
     * @todo Interim behaviour, to be reworked. The operator is told nothing: the operation reports
     * success while that item silently kept its former access list. Telling them means computing
     * the cascade before the dialog is confirmed, so the dialog can list the items a row was not
     * applied to, the way it already does for the items the operator does not own.
     */
    if (!resultingPermissions.length || !resultingPermissions.items.some((permission) => permission.isOwner())) {
      return new PermissionChangesCollection([]);
    }
    return PermissionChangesCollection.calculateChanges(entity.permissions, resultingPermissions);
  }

  /**
   * Shared by forResourceWithTargetPermissions and forFolderWithTargetPermissions.
   * The confirmed set is the complete access list the item must end up with.
   * Nothing is dropped as inherited and nothing is kept because it was higher, so a lowering or a
   * removal the operator asked for goes through.
   * The set must still leave somebody as owner. That is checked first, so a malformed one coming
   * over the wire can never strip the last owner.
   *
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
    const expectedPermissions = targetPermissions.cloneForAco(aco, entity.id, false);
    // assertAtLeastOneOwner passes on an empty collection, so check for empty separately.
    // Without it, an empty set would delete every permission, the operator's own included.
    const name = CalculatePermissionsChangesService._entityName(entity, aco);
    if (!expectedPermissions.length) {
      throw new Error(i18n.t("The confirmed permissions would leave {{name}} without any permission.", { name }));
    }
    try {
      expectedPermissions.assertAtLeastOneOwner();
    } catch {
      throw new Error(i18n.t("The confirmed permissions would leave {{name}} without owner.", { name }));
    }
    return PermissionChangesCollection.calculateChanges(entity.permissions, expectedPermissions);
  }

  /**
   * The name of the item a refusal message points at.
   * @param {FolderEntity|ResourceEntity} entity
   * @param {string} aco One of `PermissionEntity.ACO_FOLDER` or `PermissionEntity.ACO_RESOURCE`.
   * @returns {string}
   * @private
   */
  static _entityName(entity, aco) {
    if (aco === PermissionEntity.ACO_FOLDER) {
      return entity.name;
    }
    return entity.metadata?.name ?? entity.id;
  }
}

export default CalculatePermissionsChangesService;
