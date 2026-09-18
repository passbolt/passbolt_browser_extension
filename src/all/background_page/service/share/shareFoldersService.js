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

import i18n from "../../sdk/i18n";
import ShareApiService from "../api/share/shareApiService";
import { assertString, assertType } from "../../utils/assertions";
import { assertUuid } from "passbolt-styleguide/src/shared/utils/assertions";
import PermissionChangesCollection from "../../model/entity/permission/change/permissionChangesCollection";
import FindResourcesService from "../resource/findResourcesService";
import FindFoldersService from "../folder/findFoldersService";
import ShareResourceService from "./shareResourceService";
import FindAndUpdateFoldersLocalStorageService from "../folder/findAndUpdateFoldersLocalStorageService";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import GetOrFindFoldersService from "../folder/getOrFindFoldersService";
import GetOrFindResourcesService from "../resource/getOrFindResourcesService";
import CalculatePermissionsChangesService from "../permission/calculatePermissionsChangesService";

export const PROGRESS_STEPS_SHARE_FOLDERS_SHARE_ONE = 1;

class ShareFoldersService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions The api client options
   * @param {AccountEntity} account The user account
   * @param {ProgressService} progressService The progress service
   */
  constructor(apiClientOptions, account, progressService) {
    this.account = account;
    this.progressService = progressService;
    this.shareApiService = new ShareApiService(apiClientOptions);
    this.getOrFindFoldersService = new GetOrFindFoldersService(account, apiClientOptions);
    this.getOrFindResourcesService = new GetOrFindResourcesService(account, apiClientOptions);
    this.findFoldersService = new FindFoldersService(apiClientOptions);
    this.findResourcesService = new FindResourcesService(account, apiClientOptions);
    this.shareResourcesService = new ShareResourceService(apiClientOptions, account, progressService);
    this.findAndUpdateFoldersLocalStorageService = new FindAndUpdateFoldersLocalStorageService(
      account,
      apiClientOptions,
    );
  }

  /**
   * Share a folder and its descendant.
   * @param {string} folderId The folder id to share
   * @param {PermissionChangesCollection} permissionsChanges The permission changes
   * @param {string} passphrase The user's private key passphrase
   * @returns {Promise<void>}
   */
  async shareOneWithContent(folderId, permissionsChanges, passphrase) {
    assertUuid(folderId, 'The parameter "folderId" should be a UUID');
    assertType(
      permissionsChanges,
      PermissionChangesCollection,
      'The parameter "permissionChanges" should be of type PermissionChangesCollection',
    );
    assertString(passphrase, 'The parameter "passphrase" should be a string');

    const folders = await this.getOrFindFoldersService.getOrFindAll();
    // Each branch stops at the first folder the operator does not own, including what it holds.
    const foldersDescendant = folders.getOwnedDescendantsStoppingAtNotOwned(folderId);
    const foldersToShareWithPermissions = await this.findFoldersToShareWithPermissions(folderId, foldersDescendant);
    const resourcesToShareWithPermissions = await this.findResourcesToShareWithPermissions(folderId, foldersDescendant);
    const folderPermissionsChanges = this.calculateFoldersPermissionChanges(
      folderId,
      permissionsChanges,
      foldersToShareWithPermissions,
    );
    const resourcesPermissionChanges = this.calculateResourcesPermissionChanges(
      permissionsChanges,
      resourcesToShareWithPermissions,
    );
    await this.saveFoldersPermissionsChanges(folderPermissionsChanges);
    if (resourcesPermissionChanges.length) {
      await this.shareResourcesService.shareAll(
        resourcesToShareWithPermissions.ids,
        resourcesPermissionChanges,
        passphrase,
      );
    }
    this.progressService.finishStep(i18n.t("Updating folders local storage"), true);
    await this.findAndUpdateFoldersLocalStorageService.findAndUpdateAll();
  }

  /**
   * Retrieve the folders to share with their permissions.
   * A folder is impacted by the share if it is the folder that is shared or a folder descendant for which the user
   * has ownership.
   * @param {string} folderId The folder id to share
   * @param {FoldersCollection} foldersDescendant The owned folders below, each branch stopping at the
   *   first folder the operator does not own.
   * @returns {Promise<FoldersCollection>}
   * @private
   */
  async findFoldersToShareWithPermissions(folderId, foldersDescendant) {
    this.progressService.finishStep(i18n.t("Retrieving folders permissions"), true);
    const foldersIdsToRetrievePermissions = [folderId, ...foldersDescendant.ids];

    return this.findFoldersService.findAllByIdsWithPermissions(foldersIdsToRetrievePermissions);
  }

  /**
   * Retrieve the resources to share with their permissions.
   * A resource is impacted by the share if it is a folder descendant for which the user has ownership.
   * @param {string} folderId The folder id to share
   * @param {FoldersCollection} foldersDescendant The owned folders below, each branch stopping at the
   *   first folder the operator does not own.
   * @returns {Promise<ResourcesCollection>}
   * @private
   */
  async findResourcesToShareWithPermissions(folderId, foldersDescendant) {
    this.progressService.finishStep(i18n.t("Retrieving resources permissions"), true);
    const resourcesDescendant = await this.getOrFindResourcesService.getOrFindAll();
    resourcesDescendant.filterByPropertyValueIn("folder_parent_id", [folderId, ...foldersDescendant.ids]);
    const resourcesDescendantWithOwnership = resourcesDescendant.filterByIsOwner();
    const resourcesIdsToRetrievePermissions = [...resourcesDescendantWithOwnership.ids];

    if (!resourcesIdsToRetrievePermissions?.length) {
      return new ResourcesCollection([]);
    }

    return this.findResourcesService.findAllByIdsWithPermissions(resourcesIdsToRetrievePermissions);
  }

  /**
   * The changes to apply to the folders below: each receives the change made on the shared folder.
   * One left with no permission or no owner is skipped, the rest of the cascade still applies.
   * @param {string} folderTargetId The folder originally target of the share.
   * @param {PermissionChangesCollection} permissionsChanges The permission changes
   * @param {FoldersCollection} foldersToShare The folders to share, with their permissions.
   * @return {PermissionChangesCollection}
   * @private
   */
  calculateFoldersPermissionChanges(folderTargetId, permissionsChanges, foldersToShare) {
    this.progressService.finishStep(i18n.t("Calculating folders permissions changes"), true);

    const foldersPermissionChanges = new PermissionChangesCollection([]);

    // Add the user requested changes to the collection of permissions changes to apply to the folders.
    foldersPermissionChanges.merge(permissionsChanges);

    for (const folderToShare of foldersToShare.items) {
      // do not calculate the permissions changes to apply to the target folder, it was already defined by the user and added earlier.
      if (folderToShare.id === folderTargetId) {
        continue;
      }
      foldersPermissionChanges.merge(
        CalculatePermissionsChangesService.forFolderWithCascadedChange(folderToShare, permissionsChanges),
      );
    }

    return foldersPermissionChanges;
  }

  /**
   * The changes to apply to the resources below: each receives the change made on the shared
   * folder. One left with no permission or no owner is skipped, the rest of the cascade applies.
   * @param {PermissionChangesCollection} permissionsChanges The permission changes
   * @param {ResourcesCollection} resourcesToShare The resources to share, with their permissions.
   * @return {PermissionChangesCollection}
   */
  calculateResourcesPermissionChanges(permissionsChanges, resourcesToShare) {
    this.progressService.finishStep(i18n.t("Calculating resources permissions changes"), true);

    const resourcesPermissionsChanges = new PermissionChangesCollection([]);

    for (const resourceToShare of resourcesToShare.items) {
      resourcesPermissionsChanges.merge(
        CalculatePermissionsChangesService.forResourceWithCascadedChange(resourceToShare, permissionsChanges),
      );
    }

    return resourcesPermissionsChanges;
  }

  /**
   * Save the folders permissions changes on the API.
   * @param {PermissionChangesCollection} permissionChanges The permission changes
   * @returns {Promise<void>}
   */
  async saveFoldersPermissionsChanges(permissionChanges) {
    assertType(
      permissionChanges,
      PermissionChangesCollection,
      'The parameter "permissionChanges" should be of type PermissionChangesCollection',
    );

    this.progressService.finishStep(i18n.t("Sharing folders"), true);
    const foldersIds = [...new Set(permissionChanges.extract("aco_foreign_key"))];
    let sharingCounter = 0;

    for (const folderId of foldersIds) {
      this.progressService.updateStepMessage(
        i18n.t("Sharing folders {{counter}}/{{total}}", { counter: ++sharingCounter, total: foldersIds.length }),
      );
      const folderPermissionChanges = permissionChanges.items.filter(
        (permissionChange) => permissionChange.acoForeignKey === folderId,
      );
      await this.shareApiService.shareFolder(folderId, { permissions: folderPermissionChanges });
    }
  }
}

export default ShareFoldersService;
