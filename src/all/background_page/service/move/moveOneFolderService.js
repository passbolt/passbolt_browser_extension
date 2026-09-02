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
 * @since         4.10.1
 */
import GetOrFindFoldersService from "../folder/getOrFindFoldersService";
import GetOrFindResourcesService from "../resource/getOrFindResourcesService";
import ShareResourceService, { PROGRESS_STEPS_SHARE_RESOURCES_SHARE_ALL } from "../share/shareResourceService";
import { assertString, assertType } from "../../utils/assertions";
import { assertUuid } from "passbolt-styleguide/src/shared/utils/assertions";
import PermissionChangesCollection from "../../model/entity/permission/change/permissionChangesCollection";
import i18n from "../../sdk/i18n";
import MoveService from "../api/move/moveService";
import ShareFoldersService, { PROGRESS_STEPS_SHARE_FOLDERS_SHARE_ONE } from "../share/shareFoldersService";
import FindFoldersService from "../folder/findFoldersService";
import FoldersCollection from "../../model/entity/folder/foldersCollection";
import FindResourcesService from "../resource/findResourcesService";
import FolderEntity from "../../model/entity/folder/folderEntity";
import FindAndUpdateFoldersLocalStorageService from "../folder/findAndUpdateFoldersLocalStorageService";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import CalculatePermissionsChangesService from "../permission/calculatePermissionsChangesService";

const STEPS_TO_COMPLETE_SHARE = PROGRESS_STEPS_SHARE_FOLDERS_SHARE_ONE + PROGRESS_STEPS_SHARE_RESOURCES_SHARE_ALL;

const STEPS_TO_COMPLETE_PERMISSIONS_OVERRIDE =
  1 + // Calculate folders permissions
  1 + // Calculate resources permissions
  STEPS_TO_COMPLETE_SHARE;

export const PROGRESS_STEPS_MOVE_FOLDER_MOVE_ONE =
  1 + // Retrieve folders permissions
  1 + // Retrieve resources permissions
  STEPS_TO_COMPLETE_PERMISSIONS_OVERRIDE +
  1 + // Move folder
  1; // Update folders local storage

class MoveOneFolderService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions The api client options
   * @param {AccountEntity} account The user account
   * @param {ProgressService} progressService The progress service
   */
  constructor(apiClientOptions, account, progressService) {
    this.account = account;
    this.progressService = progressService;
    this.shareResourceService = new ShareResourceService(apiClientOptions, account, this.progressService);
    this.shareFolderService = new ShareFoldersService(apiClientOptions, account, this.progressService);
    this.getOrFindFoldersService = new GetOrFindFoldersService(account, apiClientOptions);
    this.getOrFindResourcesService = new GetOrFindResourcesService(account, apiClientOptions);
    this.findFoldersService = new FindFoldersService(apiClientOptions);
    this.findResourcesService = new FindResourcesService(account, apiClientOptions);
    this.moveApiService = new MoveService(apiClientOptions);
    this.findAndUpdateFoldersLocalStorage = new FindAndUpdateFoldersLocalStorageService(account, apiClientOptions);
  }

  /**
   * Move one folder and apply the permissions the operator confirmed, to the folder and to what it
   * contains. Without an entry for the folder, it just moves and keeps the permissions it has.
   * The styleguide move flow decides what those permissions are.
   * @param {string} folderId The folder id to move.
   * @param {string|null} destinationFolderId The destination folder or null for the root folder.
   * @param {Map<string, PermissionsCollection>} confirmedPermissions The permissions the operator confirmed, keyed by item id. May be empty.
   * @param {string} passphrase The user passphrase.
   * @returns {Promise<void>}
   * @throws {TypeError} If the folderId is not a UUID
   * @throws {TypeError} If the destinationFolderId is not a UUID
   * @throws {Error} If the folderId is equal to destinationFolderId
   * @throws {TypeError} If confirmedPermissions is defined and is not a Map
   * @throws {TypeError} If the passphrase is defined and is not a string
   * @throw {Error} If the destination folder is the root and the folder is already the root folder
   * @throw {Error} If the destination folder is already the parent folder
   */
  async moveOne(folderId, destinationFolderId, confirmedPermissions, passphrase) {
    assertUuid(folderId, 'The parameter "folderId" should be a UUID');
    if (destinationFolderId !== null) {
      assertUuid(destinationFolderId, 'The parameter "destinationFolderId" should be a UUID');
    }
    if (folderId === destinationFolderId) {
      throw new Error(i18n.t("The folder cannot be moved inside itself."));
    }
    assertType(confirmedPermissions, Map, 'The parameter "confirmedPermissions" should be a Map keyed by item id.');
    if (passphrase) {
      assertString(passphrase, 'The parameter "passphrase" should be a string');
    }

    const folder = await this.getOrFindFoldersService.getOrFindById(folderId);
    const parentFolder = folder.folderParentId
      ? await this.findFoldersService.findByIdWithPermissions(folder.folderParentId)
      : null;
    const destinationFolder = destinationFolderId
      ? await this.findFoldersService.findByIdWithPermissions(destinationFolderId)
      : null;

    // Checked before looking any permission up, so a refused move fetches nothing.
    this.assertFolderCanBeMoved(folder, destinationFolder, parentFolder);

    // The operator only reviews the moved folder itself. What they confirm there becomes the folder's
    // new access list, and the change it represents is what gets copied onto the content.
    const folderTargetPermissions = confirmedPermissions.get(folderId) ?? null;

    // Work out the folder's own change first, against the permissions it has right now.
    // An impossible result, an access list with nobody as owner for instance, then throws before
    // anything has moved. And if the folder's own permissions do not actually change, nothing is
    // copied onto the content either.
    this.progressService.finishStep(i18n.t("Retrieving folders permissions"), true);
    let movedFolderPermissionChanges = null;
    if (folderTargetPermissions) {
      if (!folder.isOwner()) {
        // The dialog only offers permissions for a folder the operator owns, so reaching this point
        // means the two disagree. Refuse rather than apply half of what was confirmed.
        throw new Error(
          i18n.t("Folder {{name}} must be owned to apply the confirmed permissions.", { name: folder.name }),
        );
      }
      const movedFolderWithPermissions = await this.findFoldersService.findByIdWithPermissions(folderId);
      movedFolderPermissionChanges = CalculatePermissionsChangesService.forFolderWithTargetPermissions(
        movedFolderWithPermissions,
        folderTargetPermissions,
      );
    }

    // Move first, change the permissions after, like the resource path does.
    // A failed move then leaves nothing behind: no re-encrypted secrets, no folder stuck at its source.
    let foldersPermissionsChanges = null;
    let resourcesPermissionsChanges = null;
    if (movedFolderPermissionChanges?.length) {
      // What the change reaches, resolved only now that there is a change to copy. The owned folders
      // below, each branch stopping at the first one the operator does not own, then their resources.
      const allFolders = await this.getOrFindFoldersService.getOrFindAll();
      const ownedDescendantFolders = allFolders.getOwnedDescendantsStoppingAtNotOwned(folderId);
      const foldersToShareWithPermissions = await this.findFoldersToShareWithPermissions(ownedDescendantFolders);
      const resourcesToShareWithPermissions = await this.findResourcesToShareWithPermissions(
        folderId,
        ownedDescendantFolders,
      );
      /*
       * The moved folder takes what the operator confirmed, as it is. It is merged in first because
       * the changes are saved folder by folder, in this order. A failure part way through then never
       * leaves the content carrying a change the folder itself never got.
       */
      foldersPermissionsChanges = new PermissionChangesCollection([]);
      foldersPermissionsChanges.merge(movedFolderPermissionChanges);
      // Only the folder's change is copied down, never its whole access list. A permission the folder
      // merely kept, unedited, must not reach an item below that never had it.
      foldersPermissionsChanges.merge(
        this.calculateFoldersPermissionChanges(foldersToShareWithPermissions.items, movedFolderPermissionChanges),
      );
      resourcesPermissionsChanges = this.calculateResourcesPermissionsChanges(
        resourcesToShareWithPermissions,
        movedFolderPermissionChanges,
      );
    } else {
      // Account for the skipped "Retrieving resources permissions" step and the override steps.
      this.progressService.finishSteps(1 + STEPS_TO_COMPLETE_PERMISSIONS_OVERRIDE);
    }

    await this.move(folder, destinationFolderId);

    try {
      if (movedFolderPermissionChanges?.length) {
        await this.shareResources(resourcesPermissionsChanges, passphrase);
        await this.shareFolders(foldersPermissionsChanges);
      }
    } catch (error) {
      /*
       * The folder has already moved on the server, so refresh local storage for the UI to show it,
       * even though the permissions failed to apply. A failure to refresh must not hide the original
       * error, so it is only logged.
       */
      try {
        await this.findAndUpdateFoldersLocalStorage.findAndUpdateAll();
      } catch (flushError) {
        console.error(flushError);
      }
      throw error;
    }

    // Update folders local storage, it shouldn't be done by the ShareOneFolderService function called to save the permissions.
    this.progressService.finishStep(i18n.t("Updating folders local storage"), true);
    await this.findAndUpdateFoldersLocalStorage.findAndUpdateAll();
  }

  /**
   * Retrieve, with their permissions, the owned folders nested under the moved one.
   * The moved folder is not part of them, the caller fetches its permissions itself.
   * @param {FoldersCollection} ownedDescendantFolders The owned folders below, each branch stopping
   *   at the first folder the operator does not own.
   * @returns {Promise<FoldersCollection>}
   * @private
   */
  async findFoldersToShareWithPermissions(ownedDescendantFolders) {
    if (!ownedDescendantFolders.ids.length) {
      return new FoldersCollection();
    }

    return this.findFoldersService.findAllByIdsWithPermissions(ownedDescendantFolders.ids);
  }

  /**
   * Retrieve the resources to share with their permissions.
   * A resource is concerned when the operator owns it and it sits in the moved folder or in one of
   * the owned folders below. A resource under a folder the operator does not own is left alone, even
   * when the operator owns the resource itself: the branch already stopped there.
   * @param {string} folderId The folder id to share
   * @param {FoldersCollection} ownedDescendantFolders The owned folders below, each branch stopping
   *   at the first folder the operator does not own.
   * @returns {Promise<ResourcesCollection>}
   * @private
   */
  async findResourcesToShareWithPermissions(folderId, ownedDescendantFolders) {
    this.progressService.finishStep(i18n.t("Retrieving resources permissions"), true);
    const resourcesDescendant = await this.getOrFindResourcesService.getOrFindAll();
    resourcesDescendant.filterByPropertyValueIn("folder_parent_id", [folderId, ...ownedDescendantFolders.ids]);
    const resourcesDescendantWithOwnership = resourcesDescendant.filterByIsOwner();
    const resourcesIdsToRetrievePermissions = [...resourcesDescendantWithOwnership.ids];

    if (!resourcesIdsToRetrievePermissions?.length) {
      return new ResourcesCollection([]);
    }

    return this.findResourcesService.findAllByIdsWithPermissions(resourcesIdsToRetrievePermissions);
  }

  /**
   * Assert if the folder can be moved
   * @param {FolderEntity} folder The folder to move
   * @param {FolderEntity|null} destinationFolder The destination folder
   * @param {FolderEntity|null} parentFolder The parent folder
   * @throw {Error} If the destination folder is the root and the folder is already the root folder
   * @throw {Error} If the destination folder is already the parent folder
   * @private
   */
  assertFolderCanBeMoved(folder, destinationFolder, parentFolder) {
    if (destinationFolder === null && parentFolder === null) {
      const message = i18n.t("Folder {{name}} is already in the root folder.", { name: folder.name });
      throw new Error(message);
    }

    if (destinationFolder && folder.folderParentId === destinationFolder.id) {
      const message = i18n.t("Folder {{name}} is already in folder {{destination}}.", {
        name: folder.name,
        destination: destinationFolder.name,
      });
      throw new Error(message);
    }
    if (!FolderEntity.canFolderMove(folder, parentFolder, destinationFolder)) {
      const message = i18n.t("Folder {{name}} can not be moved.", { name: folder.name });
      throw new Error(message);
    }
  }

  /**
   * Calculate the folder permission changes to apply.
   * The caller already computed the moved folder's own change. Each owned folder below receives the
   * same change, and keeps everything else it holds. A folder the change would leave with no
   * permission at all, or with nobody as owner, keeps what it has. Only that one is left out.
   * The moved folder is not handled here, the caller merges its own change in.
   *
   * @param {Array<FolderEntity>} foldersToShare The owned folders below, with their permissions.
   * @param {PermissionChangesCollection} movedFolderPermissionChanges The change made on the moved folder.
   * @return {PermissionChangesCollection}
   * @private
   */
  calculateFoldersPermissionChanges(foldersToShare, movedFolderPermissionChanges) {
    this.progressService.finishStep(i18n.t("Calculating folders permissions changes"), true);

    const permissionChanges = new PermissionChangesCollection([]);
    for (const folderToShare of foldersToShare) {
      permissionChanges.merge(
        CalculatePermissionsChangesService.forFolderWithCascadedChange(folderToShare, movedFolderPermissionChanges),
      );
    }

    return permissionChanges;
  }

  /**
   * Calculate the resource permission changes to apply.
   * Each owned resource below receives the moved folder's change, and keeps everything else it holds.
   * A resource the change would leave with no permission at all, or with nobody as owner, keeps what
   * it has. Only that one is left out.
   *
   * @param {ResourcesCollection} resourcesToShare The resources that could be shared.
   * @param {PermissionChangesCollection} movedFolderPermissionChanges The change made on the moved folder.
   * @returns {PermissionChangesCollection}
   * @private
   */
  calculateResourcesPermissionsChanges(resourcesToShare, movedFolderPermissionChanges) {
    this.progressService.finishStep(i18n.t("Calculating resources permissions changes"), true);

    const resourcePermissionChanges = new PermissionChangesCollection([]);
    for (const resourceToShare of resourcesToShare) {
      const resourcePermissionChange = CalculatePermissionsChangesService.forResourceWithCascadedChange(
        resourceToShare,
        movedFolderPermissionChanges,
      );
      resourcePermissionChanges.merge(resourcePermissionChange);
    }

    return resourcePermissionChanges;
  }

  /**
   * Share the resources.
   * @param {PermissionChangesCollection} resourcesPermissionsChanges The permission changes
   * @param {string} passphrase The user passphrase.
   * @returns {Promise<void>}
   */
  async shareResources(resourcesPermissionsChanges, passphrase) {
    const resourceIds = new Set();
    resourcesPermissionsChanges.items.forEach((resourcePermissionChange) =>
      resourceIds.add(resourcePermissionChange.acoForeignKey),
    );
    if (resourceIds.size) {
      await this.shareResourceService.shareAll([...resourceIds], resourcesPermissionsChanges, passphrase);
    } else {
      this.progressService.finishSteps(PROGRESS_STEPS_SHARE_RESOURCES_SHARE_ALL);
    }
  }

  /**
   * Share the folders.
   * @param {PermissionChangesCollection} foldersPermissionsChanges The permission changes
   * @returns {Promise<void>}
   */
  async shareFolders(foldersPermissionsChanges) {
    if (foldersPermissionsChanges.length) {
      await this.shareFolderService.saveFoldersPermissionsChanges(foldersPermissionsChanges);
    } else {
      this.progressService.finishSteps(PROGRESS_STEPS_SHARE_FOLDERS_SHARE_ONE);
    }
  }

  /**
   * Move the folder
   * @param {FolderEntity} folder The folder to move.
   * @param {string|null} destinationFolderId The destination folder id.
   * @returns {Promise<void>}
   */
  async move(folder, destinationFolderId) {
    this.progressService.finishStep(i18n.t("Moving folder"), true);
    await this.moveApiService.moveFolder(folder.id, destinationFolderId);
  }
}

export default MoveOneFolderService;
