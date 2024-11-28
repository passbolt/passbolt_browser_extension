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
import ShareResourceService, {PROGRESS_STEPS_SHARE_RESOURCES_SHARE_ALL} from "../share/shareResourceService";
import {assertString, assertType, assertUuid} from "../../utils/assertions";
import PermissionChangesCollection from "../../model/entity/permission/change/permissionChangesCollection";
import i18n from "../../sdk/i18n";
import FolderModel from "../../model/folder/folderModel";
import ShareFoldersService, {PROGRESS_STEPS_SHARE_FOLDERS_SHARE_ONE} from "../share/shareFoldersService";
import FindFoldersService from "../folder/findFoldersService";
import FoldersCollection from "../../model/entity/folder/foldersCollection";
import FindResourcesService from "../resource/findResourcesService";
import FolderEntity from "../../model/entity/folder/folderEntity";
import FindAndUpdateFoldersLocalStorageService from "../folder/findAndUpdateFoldersLocalStorageService";
import ResourceModel from "../../model/resource/resourceModel";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import ConfirmMoveStrategyService from "./confirmMoveStrategyService";

const STEPS_TO_COMPLETE_SHARE = PROGRESS_STEPS_SHARE_FOLDERS_SHARE_ONE
  + PROGRESS_STEPS_SHARE_RESOURCES_SHARE_ALL;

const STEPS_TO_COMPLETE_PERMISSIONS_OVERRIDE = 1 // Calculate folders permissions
  + 1 // Calculate resources permissions
  + 1 // Confirm share operation
  + STEPS_TO_COMPLETE_SHARE;

export const PROGRESS_STEPS_MOVE_ONE = 1 // Retrieve folders permissions
  + 1 // Retrieve resources permissions
  + STEPS_TO_COMPLETE_PERMISSIONS_OVERRIDE
  + 1 // Move folder
  + 1; // Update folders local storage

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
    this.folderModel = new FolderModel(apiClientOptions, account);
    this.resourceModel = new ResourceModel(apiClientOptions);
    this.findAndUpdateFoldersLocalStorage = new FindAndUpdateFoldersLocalStorageService(account, apiClientOptions);
  }

  /**
   * Move on folder.
   * @param {string} folderId The folder id to move.
   * @param {string|null} destinationFolderId The destination folder or null for the root folder.
   * @param {ConfirmMoveStrategyService} moveStrategyService The move strategy confirmation service.
   * @param {string} passphrase The user passphrase.
   * @returns {Promise<void>}
   * @throws {TypeError} If the folderId is not a UUID
   * @throws {TypeError} If the destinationFolderId is not a UUID
   * @throws {Error} If the folderId is equal to destinationFolderId
   * @throws {TypeError} If the moveStrategyService is not of type MoveStrategyService
   * @throws {TypeError} If the passphrase is defined and is not a string
   * @throw {Error} If the destination folder is the root and the folder is already the root folder
   * @throw {Error} If the destination folder is already the parent folder
   */
  async moveOne(folderId, destinationFolderId, moveStrategyService, passphrase) {
    assertUuid(folderId, "The parameter \"folderId\" should be a UUID");
    if (destinationFolderId !== null) {
      assertUuid(destinationFolderId, "The parameter \"destinationFolderId\" should be a UUID");
    }
    if (folderId === destinationFolderId) {
      throw new Error(i18n.t("The folder cannot be moved inside itself."));
    }
    assertType(moveStrategyService, ConfirmMoveStrategyService, "The parameter \"moveStrategyService\" should be MoveStrategy service instance.");
    if (passphrase) {
      assertString(passphrase, "The parameter \"passphrase\" should be a string");
    }

    const folder = await this.getOrFindFoldersService.getOrFindById(folderId);
    const foldersToShareWithPermissions = await this.findFoldersToShareWithPermissions(folder);
    const parentFolder = folder.folderParentId ? await this.findFoldersService.findByIdWithPermissions(folder.folderParentId) : null;
    const destinationFolder = destinationFolderId ? await this.findFoldersService.findByIdWithPermissions(destinationFolderId) : null;
    const resourcesToShareWithPermissions = await this.findResourcesToShareWithPermissions(folderId);

    this.assertFolderCanBeMoved(folder, destinationFolder, parentFolder);

    const couldOverridePermissions = this.checkCouldOverridePermissions(folder, destinationFolder, parentFolder);
    if (couldOverridePermissions) {
      const foldersPermissionsChanges = this.calculateFoldersPermissionChanges(folder, foldersToShareWithPermissions, destinationFolder, parentFolder);
      const resourcesPermissionsChanges = this.calculateResourcesPermissionsChanges(resourcesToShareWithPermissions, destinationFolder, parentFolder);
      const isShareConfirmed = await this.confirmShareOperation(folder, destinationFolder, moveStrategyService, foldersPermissionsChanges, resourcesPermissionsChanges);
      if (isShareConfirmed) {
        await this.shareResources(resourcesPermissionsChanges, passphrase);
        await this.shareFolders(foldersPermissionsChanges);
      } else {
        this.progressService.finishSteps(STEPS_TO_COMPLETE_SHARE);
      }
    } else {
      this.progressService.finishSteps(STEPS_TO_COMPLETE_PERMISSIONS_OVERRIDE);
    }

    await this.move(folder, destinationFolderId);

    // Update folders local storage, it shouldn't be done by the ShareOneFolderService function called to save the permissions.
    this.progressService.finishStep(i18n.t("Updating folders local storage"), true);
    await this.findAndUpdateFoldersLocalStorage.findAndUpdateAll();
  }

  /**
   * Retrieve the folders to share with their permissions.
   * A folder is impacted by the share if it is the folder that is shared or a folder descendant for which the user
   * has ownership.
   * @param {FolderEntity} folder The folder to share
   * @returns {Promise<FoldersCollection>}
   * @private
   */
  async findFoldersToShareWithPermissions(folder) {
    this.progressService.finishStep(i18n.t("Retrieving folders permissions"), true);
    const folders = await this.getOrFindFoldersService.getOrFindAll();
    const foldersDescendant = FoldersCollection.getAllChildren(folder.id, folders, new FoldersCollection([]));
    const foldersDescendantWithOwnership = foldersDescendant.filterByIsOwner();
    const foldersIdsToRetrievePermissions = foldersDescendantWithOwnership.ids;
    if (folder.isOwner()) {
      foldersIdsToRetrievePermissions.unshift(folder.id);
    }

    return this.findFoldersService.findAllByIdsWithPermissions(foldersIdsToRetrievePermissions);
  }

  /**
   * Retrieve the resources to share with their permissions.
   * A resource is impacted by the share if it is a folder descendant for which the user has ownership.
   * @param {string} folderId The folder id to share
   * @returns {Promise<ResourcesCollection>}
   * @private
   */
  async findResourcesToShareWithPermissions(folderId) {
    this.progressService.finishStep(i18n.t("Retrieving resources permissions"), true);
    const folders = await this.getOrFindFoldersService.getOrFindAll();
    const foldersDescendant = FoldersCollection.getAllChildren(folderId, folders, new FoldersCollection([]));
    const resourcesDescendant = await this.getOrFindResourcesService.getOrFindAll();
    resourcesDescendant.filterByPropertyValueIn("folder_parent_id", [folderId, ...foldersDescendant.ids]);
    const resourcesDescendantWithOwnership = resourcesDescendant.filterByIsOwner();
    const resourcesIdsToRetrievePermissions = [...resourcesDescendantWithOwnership.ids];

    if (!(resourcesIdsToRetrievePermissions?.length)) {
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
      const message = i18n.t('Folder {{name}} is already in the root folder.', {name: folder.name});
      throw new Error(message);
    }

    if (destinationFolder && folder.folderParentId === destinationFolder.id) {
      const message = i18n.t('Folder {{name}} is already in folder {{destination}}.', {name: folder.name, destination: destinationFolder.name});
      throw new Error(message);
    }
    if (!FolderEntity.canFolderMove(folder, parentFolder, destinationFolder)) {
      const message = i18n.t('Folder {{name}} can not be moved.', {name: folder.name});
      throw new Error(message);
    }
  }

  /**
   * Check if the permissions could be overridden.
   *
   * There is no permission override if, the folder is moved:
   * - from the root to a personal folder;
   * - from a personal folder to a personal folder;
   * - from a personal folder to the root.
   *
   * @param {FolderEntity} folder The folder to move
   * @param {FolderEntity|null} destinationFolder The destination folder
   * @param {FolderEntity|null} parentFolder The parent folder
   * @returns {boolean}
   */
  checkCouldOverridePermissions(folder, destinationFolder, parentFolder) {
    const isDestinationFolderPersonalOrRoot = destinationFolder === null || destinationFolder.isPersonal();
    const isParentFolderPersonalOrRoot = parentFolder === null || parentFolder.isPersonal();

    if (folder.isShared() && isDestinationFolderPersonalOrRoot && isParentFolderPersonalOrRoot) {
      return false;
    }

    return true;
  }

  /**
   * Calculate folders permissions changes.
   *
   * @param {FolderEntity} folder The folder originally target by the move.
   * @param {FoldersCollection} foldersToShare The folders to share, with their permissions.
   * @param {FolderEntity} destinationFolder The destination folder.
   * @param {FolderEntity} parentFolder The parent folder.
   * @return {PermissionChangesCollection}
   * @private
   */
  calculateFoldersPermissionChanges(folder, foldersToShare, destinationFolder, parentFolder) {
    this.progressService.finishStep(i18n.t("Calculating folders permissions changes"), true);

    const isDestinationFolderPersonalOrRoot = destinationFolder === null || destinationFolder.isPersonal();
    const isParentFolderPersonalOrRoot = parentFolder === null || parentFolder.isPersonal();
    if (folder.isShared() && isDestinationFolderPersonalOrRoot && isParentFolderPersonalOrRoot) {
      return new PermissionChangesCollection([]);
    }

    const permissionChanges =  new PermissionChangesCollection([]);
    for (const folderToShare of foldersToShare) {
      const childrenFolderPermissionChange = this.folderModel.calculatePermissionsChangesForMove(folderToShare, parentFolder, destinationFolder);
      permissionChanges.merge(childrenFolderPermissionChange);
    }

    return permissionChanges;
  }

  /**
   * Calculate the resources permissions changes.
   *
   * @param {ResourcesCollection} resourcesToShare The resources that could be shared.
   * @param {FolderEntity} destinationFolder The destination folder.
   * @param {FolderEntity} parentFolder The parent folder.
   * @returns {PermissionChangesCollection}
   */
  calculateResourcesPermissionsChanges(resourcesToShare, destinationFolder, parentFolder) {
    this.progressService.finishStep(i18n.t("Calculating resources permissions changes"), true);

    const resourcePermissionChanges = new PermissionChangesCollection([]);
    for (const resourceToShare of resourcesToShare) {
      const resourcePermissionChange = this.resourceModel.calculatePermissionsChangesForMove(resourceToShare, parentFolder, destinationFolder);
      resourcePermissionChanges.merge(resourcePermissionChange);
    }

    return resourcePermissionChanges;
  }

  /**
   * Confirm the share operation with the user.
   *
   * @param {FolderEntity} folder The folder to move
   * @param {FolderEntity|null} destinationFolder The destination folder
   * @param {ConfirmMoveStrategyService} moveStrategyService
   * @param {PermissionChangesCollection} foldersPermissionsChanges The folders permission changes
   * @param {PermissionChangesCollection} resourcesPermissionsChanges The resources permission changes
   * @returns {Promise<boolean>}
   */
  async confirmShareOperation(folder, destinationFolder, moveStrategyService, foldersPermissionsChanges, resourcesPermissionsChanges) {
    this.progressService.finishStep(i18n.t("Confirming share operation"), true);

    if (foldersPermissionsChanges.length || resourcesPermissionsChanges.length) {
      return await moveStrategyService.confirm(destinationFolder?.id, folder.id);
    }

    return false;
  }

  /**
   * Share the resources.
   * @param {PermissionChangesCollection} resourcesPermissionsChanges The permission changes
   * @param {string} passphrase The user passphrase.
   * @returns {Promise<void>}
   */
  async shareResources(resourcesPermissionsChanges, passphrase) {
    const resourceIds = new Set();
    resourcesPermissionsChanges.items.forEach(resourcePermissionChange => resourceIds.add(resourcePermissionChange.acoForeignKey));
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
    this.progressService.finishStep(i18n.t('Moving folder'), true);
    await this.folderModel.move(folder.id, destinationFolderId);
  }
}

export default MoveOneFolderService;
