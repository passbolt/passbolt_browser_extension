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

const STEPS_SKIPPED_WITHOUT_PERMISSIONS_CHANGE =
  1 + // Retrieve resources permissions
  STEPS_TO_COMPLETE_PERMISSIONS_OVERRIDE;

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
   * contains. Without an entry for the folder, it moves and keeps the permissions it has.
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

    this.assertFolderCanBeMoved(folder, destinationFolder, parentFolder);

    const folderTargetPermissions = confirmedPermissions.get(folderId) ?? null;

    this.progressService.finishStep(i18n.t("Retrieving folders permissions"), true);
    let movedFolderPermissionChanges = null;
    if (folderTargetPermissions) {
      if (!folder.isOwner()) {
        // The dialog only confirms permissions for an owned folder, so reaching this means the two disagree.
        throw new Error(`Folder ${folder.id} must be owned to apply the confirmed permissions.`);
      }
      const movedFolderWithPermissions = await this.findFoldersService.findByIdWithPermissions(folderId);
      movedFolderPermissionChanges = CalculatePermissionsChangesService.forFolderWithTargetPermissions(
        movedFolderWithPermissions,
        folderTargetPermissions,
      );
    }

    let foldersPermissionsChanges = null;
    let resourcesPermissionsChanges = null;
    if (movedFolderPermissionChanges?.length) {
      const allFolders = await this.getOrFindFoldersService.getOrFindAll();
      const ownedDescendantFolders = allFolders.getOwnedDescendantsStoppingAtNotOwned(folderId);
      const foldersToShareWithPermissions = await this.findFoldersToShareWithPermissions(ownedDescendantFolders);
      const resourcesToShareWithPermissions = await this.findResourcesToShareWithPermissions(
        folderId,
        ownedDescendantFolders,
      );
      foldersPermissionsChanges = new PermissionChangesCollection([]);
      // Merged first: the changes are saved in order, so a failure never leaves the content ahead of the folder.
      foldersPermissionsChanges.merge(movedFolderPermissionChanges);
      foldersPermissionsChanges.merge(
        this.calculateFoldersPermissionChanges(foldersToShareWithPermissions.items, movedFolderPermissionChanges),
      );
      resourcesPermissionsChanges = this.calculateResourcesPermissionsChanges(
        resourcesToShareWithPermissions,
        movedFolderPermissionChanges,
      );
    } else {
      this.progressService.finishSteps(STEPS_SKIPPED_WITHOUT_PERMISSIONS_CHANGE);
    }

    // Move before applying the permissions: a failed move then leaves no re-encrypted secret behind.
    await this.move(folder, destinationFolderId);

    try {
      if (movedFolderPermissionChanges?.length) {
        await this.shareResources(resourcesPermissionsChanges, passphrase);
        await this.shareFolders(foldersPermissionsChanges);
      }
    } catch (error) {
      // The folder already moved, so refresh the local storage; a failed refresh must not hide the original error.
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
   * Retrieve, with their permissions, the owned folders nested under the moved one, which is not
   * included.
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
   * Retrieve the resources to share with their permissions: the owned ones sitting in the moved
   * folder or in an owned folder below, the branches stopping at the first not-owned folder.
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
   * The changes to apply to the folders below: each receives the moved folder's change and keeps
   * everything else it holds. One left with no permission or no owner is skipped.
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
   * The changes to apply to the resources below: each receives the moved folder's change and keeps
   * everything else it holds. One left with no permission or no owner is skipped.
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
