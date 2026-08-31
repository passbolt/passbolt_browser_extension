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
import PermissionChangesCollection from "../../model/entity/permission/change/permissionChangesCollection";
import i18n from "../../sdk/i18n";
import FindResourcesService from "../../service/resource/findResourcesService";
import ShareResourceService, { PROGRESS_STEPS_SHARE_RESOURCES_SHARE_ALL } from "../share/shareResourceService";
import { assertNonEmptyArray, assertString, assertType } from "../../utils/assertions";
import { assertArrayUUID, assertUuid } from "passbolt-styleguide/src/shared/utils/assertions";
import FindFoldersService from "../folder/findFoldersService";
import MoveService from "../api/move/moveService";
import FoldersCollection from "../../model/entity/folder/foldersCollection";
import ResourceUpdateLocalStorageService from "../resource/update/resourceUpdateLocalStorageService";
import CalculatePermissionsChangesService from "../permission/calculatePermissionsChangesService";

export const PROGRESS_STEPS_MOVE_RESOURCES_MOVE_ALL =
  1 + // Retrieving destination folder permissions
  1 + // Retrieving resources permissions
  1 + // Retrieving all resources parent folders permissions
  1 + // Calculating resources permissions changes
  1 + // Moving resources
  PROGRESS_STEPS_SHARE_RESOURCES_SHARE_ALL;

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
    this.findResourcesService = new FindResourcesService(account, apiClientOptions);
    this.shareResourceService = new ShareResourceService(apiClientOptions, account, progressService);
    this.findFoldersService = new FindFoldersService(apiClientOptions);
    this.moveApiService = new MoveService(apiClientOptions);
    this.resourceUpdateLocalStorageService = new ResourceUpdateLocalStorageService();
  }

  /**
   * Move the given resources into the given destination folder, applying the permissions the
   * operator confirmed to the ones they own.
   * A resource without an entry just moves and keeps the permissions it has.
   *
   * @param {array<string>} resourcesIds
   * @param {string|null} destinationFolderId
   * @param {Map<string, PermissionsCollection>} confirmedPermissions The permissions the operator confirmed, keyed by resource id. May be empty.
   * @param {string} passphrase
   * @returns {Promise<{skippedResourceIds: Array<string>}>} The ids of the resources that could not be moved.
   */
  async moveAll(resourcesIds, destinationFolderId, confirmedPermissions, passphrase) {
    assertNonEmptyArray(resourcesIds, "Could not move, expecting at least a resource to be provided.");
    assertArrayUUID(resourcesIds, "Could not move, expecting resourcesIds to be an array of UUIDs.");
    if (destinationFolderId) {
      assertUuid(destinationFolderId, "Could not move, expecting destinationFolderId to be a valid UUID.");
    }
    assertType(confirmedPermissions, Map, 'The parameter "confirmedPermissions" should be a Map keyed by resource id.');
    if (passphrase) {
      assertString(passphrase);
    }

    const destinationFolder = await this.findDestinationFolderWithPermissions(destinationFolderId);
    const resources = await this.findAllResourcesWithPermissions(resourcesIds);
    const resourcesParentFolders = await this.findAllFoldersWithPermissions([...new Set(resources.folderParentIds)]);
    const skippedResourceIds = this.filterOutResourcesThatWontMove(
      resources,
      resourcesParentFolders,
      destinationFolder,
    );
    this.filterOutResourcesAlreadyInDestination(resources, destinationFolderId);

    const changes = this.calculateChanges(resources, confirmedPermissions);

    await this.move(resources, destinationFolderId);
    await this.share(resources, changes, passphrase);

    return { skippedResourceIds };
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
    const hasMissingResources = resourcesIds.some((id) => !resources.getFirstById(id));
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
   * Filter out resources that will not move, returning their ids so the caller can report them.
   * @param {ResourcesCollection} resources
   * @param {FoldersCollection} resourcesParentFolders
   * @param {FolderEntity} destinationFolder
   * @returns {Array<string>} The ids of the resources removed because they cannot be moved.
   * @private
   */
  filterOutResourcesThatWontMove(resources, resourcesParentFolders, destinationFolder) {
    const skippedResourceIds = [];
    resources.filterByCallback((resource) => {
      const parentFolder = resource.folderParentId ? resourcesParentFolders.getById(resource.folderParentId) : null;

      const canMove = resource.canMove(parentFolder, destinationFolder);
      if (!canMove) {
        console.warn(`Resource "${resource.id}" cannot be moved, skipping.`);
        skippedResourceIds.push(resource.id);
      }

      return canMove;
    });
    return skippedResourceIds;
  }

  /**
   * Filter out the resources that already sit in the destination folder. Moving an item into the
   * folder it is already in does nothing, so it is skipped without error (a debug log only) and,
   * because it does not move, its permissions are left untouched: the filtering happens before the
   * changes are calculated so no confirmed target is ever applied to it.
   * @param {ResourcesCollection} resources
   * @param {string|null} destinationFolderId
   * @returns {void}
   * @private
   */
  filterOutResourcesAlreadyInDestination(resources, destinationFolderId) {
    resources.filterByCallback((resource) => {
      const isMoving = resource.folderParentId !== destinationFolderId;
      if (!isMoving) {
        console.debug(`Resource "${resource.id}" is already in the destination folder, skipping.`);
      }
      return isMoving;
    });
  }

  /**
   * Build the permission changes to apply from what the operator confirmed.
   * Only the resources the operator owns can change, the others just move.
   * Each owned resource is set to exactly what was confirmed for it, so lowering or removing a
   * permission takes effect.
   * @param {ResourcesCollection} resources
   * @param {Map<string, PermissionsCollection>} confirmedPermissions The permissions the operator confirmed, keyed by resource id. May be empty.
   * @returns {PermissionChangesCollection}
   * @private
   */
  calculateChanges(resources, confirmedPermissions) {
    this.progressService.finishStep(i18n.t("Calculating resources permissions changes"), true);

    const resultingChanges = new PermissionChangesCollection([]);
    for (const resource of resources) {
      this.progressService.updateStepMessage(
        i18n.t("Calculating changes for {{name}}", { name: resource.metadata.name }),
      );
      /*
       * A user who can update a resource can move it
       * But to change the rights they need to be owner
       */
      if (!resource.isOwner()) {
        continue;
      }

      const targetPermissions = confirmedPermissions.get(resource.id);
      if (!targetPermissions) {
        continue;
      }

      const changes = CalculatePermissionsChangesService.forResourceWithTargetPermissions(resource, targetPermissions);
      resultingChanges.merge(changes);
    }

    return resultingChanges;
  }

  /**
   * Move the resources into the target destination foler. The resources that will not move have
   * already been filtered out by the caller, so `resources` and the calculated changes stay aligned.
   * @param {ResourcesCollection} resources The resources to move
   * @param {string} destinationFolderId The target destination folder id
   * @returns {Promise<void>}
   * @private
   */
  async move(resources, destinationFolderId) {
    if (resources.length === 0) {
      this.progressService.finishSteps(1);
      return;
    }

    this.progressService.finishStep(i18n.t("Moving resources"), true);

    const movedResourceIds = [];
    try {
      for (const resource of resources) {
        this.progressService.updateStepMessage(i18n.t("Moving {{name}}", { name: resource.metadata.name }));
        await this.moveApiService.moveResource(resource.id, destinationFolderId);
        movedResourceIds.push(resource.id);
      }
    } catch (error) {
      // The batch failed part way through, so refresh the resources that did move. Without this they
      // would keep showing in the folder they left.
      // A failure to refresh must not hide the original error, so it is only logged.
      if (movedResourceIds.length) {
        try {
          await this.resourceUpdateLocalStorageService.updateFolderParentId(movedResourceIds, destinationFolderId);
        } catch (flushError) {
          console.error(flushError);
        }
      }
      throw error;
    }
    await this.resourceUpdateLocalStorageService.updateFolderParentId(movedResourceIds, destinationFolderId);
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
