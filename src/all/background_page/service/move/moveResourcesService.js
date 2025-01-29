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
import ResourceModel from "../../model/resource/resourceModel";
import FolderModel from "../../model/folder/folderModel";
import PermissionChangesCollection from "../../model/entity/permission/change/permissionChangesCollection";
import i18n from "../../sdk/i18n";
import FindResourcesService from "../../service/resource/findResourcesService";
import ShareResourceService, {PROGRESS_STEPS_SHARE_RESOURCES_SHARE_ALL} from "../share/shareResourceService";
import {assertArrayUUID, assertNonEmptyArray, assertString, assertUuid} from "../../utils/assertions";
import FindFoldersService from "../folder/findFoldersService";
import MoveService from "../api/move/moveService";
import FoldersCollection from "../../model/entity/folder/foldersCollection";

export const PROGRESS_STEPS_MOVE_RESOURCES_MOVE_ALL = 1 // Retrieving destination folder permissions
  + 1 // Retrieving resources permissions
  + 1 // Retrieving all resources parent folders permissions
  + 1 // Calculating resources permissions changes
  + 1 // Moving resources
  + PROGRESS_STEPS_SHARE_RESOURCES_SHARE_ALL;

class MoveResourcesService {
  /**
   * @constructor
   *
   * @param {ApiClientOptions} apiClientOptions the api client options
   * @param {AccountEntity} account the account associated to the worker
   * @param {ProgressService} progressService The progress service
   */
  constructor(apiClientOptions, account, progressService) {
    this.progressService = progressService;
    this.folderModel = new FolderModel(apiClientOptions, account);
    this.resourceModel = new ResourceModel(apiClientOptions);
    this.findResourcesService = new FindResourcesService(account, apiClientOptions);
    this.shareResourceService = new ShareResourceService(apiClientOptions, account, progressService);
    this.findFoldersService = new FindFoldersService(apiClientOptions);
    this.moveApiService = new MoveService(apiClientOptions);
  }

  /**
   * Moves resources given their ids to a destination folder (given its id).
   *
   * @param {array<string>} resourcesIds
   * @param {string|null} destinationFolderId
   * @param {string} passphrase
   */
  async moveAll(resourcesIds, destinationFolderId, passphrase) {
    assertNonEmptyArray(resourcesIds, 'Could not move, expecting at least a resource to be provided.');
    assertArrayUUID(resourcesIds, 'Could not move, expecting resourcesIds to be an array of UUIDs.');
    if (destinationFolderId) {
      assertUuid(destinationFolderId, 'Could not move, expecting destinationFolderId to be a valid UUID.');
    }
    if (passphrase) {
      assertString(passphrase);
    }

    const destinationFolder = await this.findDestinationFolderWithPermissions(destinationFolderId);
    const resources = await this.findAllResourcesWithPermissions(resourcesIds);
    const resourcesParentFolders = await this.findAllFoldersWithPermissions([...new Set(resources.folderParentIds)]);
    this.filterOutResourcesThatWontMove(resources, resourcesParentFolders, destinationFolder);

    const changes = await this.calculateChanges(resources, resourcesParentFolders, destinationFolder);

    await this.move(resources, destinationFolderId);
    await this.share(resources, changes, passphrase);
  }

  /**
   * Find the destination folder given its id if not null.
   * @param {string} destinationFolderId
   * @returns {Promise<FolderEntity|null>}
   * @throws Error if the destinationFolderId is set and the folder cannot be retrieved.
   * @private
   */
  async findDestinationFolderWithPermissions(destinationFolderId) {
    this.progressService.finishStep(i18n.t("Retrieving destination folder permissions"), true);

    if (!destinationFolderId) {
      return null;
    }

    const destinationFolder = await this.findFoldersService.findByIdWithPermissions(destinationFolderId);
    if (!destinationFolder) {
      throw new Error("Could not move, the destination folder does not exist.");
    }

    return destinationFolder;
  }

  /**
   * Find all the resources permissions given their ids.
   * @param {Array<string>} resourcesIds
   * @returns {Promise<ResourcesCollection>}
   * @throws Error if one the given resources ids cannot be retrieved.
   * @private
   */
  async findAllResourcesWithPermissions(resourcesIds) {
    this.progressService.finishStep(i18n.t("Retrieving resources permissions"), true);

    const resources = await this.findResourcesService.findAllByIdsWithPermissions(resourcesIds);
    const hasMissingResources = resourcesIds.some(id => !resources.getFirstById(id));
    if (hasMissingResources) {
      throw new Error("Could not move, some resources do not exist.");
    }

    return resources;
  }

  /**
   * Find all the folders with their permissions given their ids.
   * @param {Array<string>} foldersIds
   * @returns {Promise<FoldersCollection>}
   * @throws Error if one the given resources ids cannot be retrieved.
   * @private
   */
  async findAllFoldersWithPermissions(foldersIds) {
    this.progressService.finishStep(i18n.t("Retrieving all resources parent folders permissions"), true);

    if (foldersIds.length === 0) {
      return new FoldersCollection([]);
    }

    return await this.findFoldersService.findAllByIdsWithPermissions(foldersIds);
  }

  /**
   * Filter out resources that will not move.
   * @param {ResourcesCollection} resources
   * @param {FoldersCollection} resourcesParentFolders
   * @param {FolderEntity} destinationFolder
   * @private
   */
  filterOutResourcesThatWontMove(resources, resourcesParentFolders, destinationFolder) {
    resources.filterByCallback(resource => {
      const parentFolder = resource.folderParentId
        ? resourcesParentFolders.getById(resource.folderParentId)
        : null;

      const canMove = resource.canMove(parentFolder, destinationFolder);
      if (!canMove) {
        console.warn(`Resource "${resource.id}" cannot be moved, skipping.`);
      }

      return canMove;
    });
  }

  /**
   * Build changes to be used for share.
   * @param {ResourcesCollection} resources
   * @param {FoldersCollection} resourcesParentFolders
   * @param {FolderEntity} destinationFolder
   * @returns {Promise<PermissionChangesCollection>}
   * @private
   */
  async calculateChanges(resources, resourcesParentFolders, destinationFolder) {
    this.progressService.finishStep(i18n.t('Calculating resources permissions changes'), true);

    const resultingChanges = new PermissionChangesCollection([]);
    for (const resource of resources) {
      this.progressService.updateStepMessage(i18n.t('Calculating changes for {{name}}', {name: resource.metadata.name}));
      /*
       * A user who can update a resource can move it
       * But to change the rights they need to be owner
       */
      if (!resource.isOwner()) {
        break;
      }

      /*
       * When a shared folder is moved, we do not change permissions when:
       * - move is from the root to a personal folder
       * - move is from a personal folder to a personal folder;
       * - move is from a personal folder to the root.
       */
      if (resource.isShared()
        && (destinationFolder === null || destinationFolder.isPersonal())
        && (resource.folderParentId === null || resource.isPersonal())) {
        break;
      }

      const parentFolder = resource.folderParentId
        ? resourcesParentFolders.getById(resource.folderParentId)
        : null;

      const changes = this.resourceModel.calculatePermissionsChangesForMove(resource, parentFolder, destinationFolder);
      resultingChanges.merge(changes);
    }

    return resultingChanges;
  }

  /**
   * Move the resources into the target destination foler.
   * @param {ResourcesCollection} resources The resources to move
   * @param {string} destinationFolderId The target destination folder id
   * @returns {Promise<void>}
   * @private
   */
  async move(resources, destinationFolderId) {
    resources.filterByCallback(resource => {
      const isMoving = resource.folderParentId !== destinationFolderId;
      if (!isMoving) {
        console.debug(`Resource "${resource.id}" is already in the destination folder, skipping.`);
      }
      return isMoving;
    });

    if (resources.length === 0) {
      this.progressService.finishSteps(1);
      return;
    }

    this.progressService.finishStep(i18n.t('Moving resources'), true);

    for (const resource of resources) {
      this.progressService.updateStepMessage(i18n.t('Moving {{name}}', {name: resource.metadata.name}));
      await this.moveApiService.moveResource(resource.id, destinationFolderId);
      resource.folderParentId = destinationFolderId;
    }

    await this.resourceModel.updateCollection(resources);
  }

  /**
   * Share the resources.
   * @param {ResourcesCollection} resources The resources to share.
   * @param {PermissionChangesCollection} changes The permissions changes to apply on the resources.
   * @param {string} passphrase The user passphrase
   * @returns {Promise<void>}
   * @private
   */
  async share(resources, changes, passphrase) {
    if (!changes.length) {
      this.progressService.finishSteps(PROGRESS_STEPS_SHARE_RESOURCES_SHARE_ALL);
      return;
    }

    await this.shareResourceService.shareAll(resources.ids, changes, passphrase);
  }
}

export default MoveResourcesService;
