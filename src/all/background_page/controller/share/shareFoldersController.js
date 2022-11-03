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
 * @since         2.8.0
 */
import Keyring from "../../model/keyring";
import ResourceModel from "../../model/resource/resourceModel";
import {PassphraseController as passphraseController} from "../passphrase/passphraseController";
import GetDecryptedUserPrivateKeyService from "../../service/account/getDecryptedUserPrivateKeyService";
import FolderModel from "../../model/folder/folderModel";
import Share from "../../model/share";
import FoldersCollection from "../../model/entity/folder/foldersCollection";
import PermissionChangesCollection from "../../model/entity/permission/change/permissionChangesCollection";
import i18n from "../../sdk/i18n";
import ProgressService from "../../service/progress/progressService";

class ShareFoldersController {
  /**
   * Controller constructor
   *
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.folderModel = new FolderModel(apiClientOptions);
    this.resourceModel = new ResourceModel(apiClientOptions);
    this.keyring = new Keyring();
    // Work variables
    this.folders = null;
    this.folder = null;
    this.subFolders = null;
    this.resources = null;

    this.originalChanges = null;
    this.foldersChanges = new PermissionChangesCollection([]);
    this.resourcesChanges = new PermissionChangesCollection([]);

    this.passphrase = null;
    this.privateKey = null;

    this.progressService = new ProgressService(this.worker);
  }

  /**
   * Orchestrate dialogs during the share operation
   *
   * @param {FoldersCollection} folders
   * @param {PermissionChangesCollection} changes
   * @return {Promise}
   */
  async main(folders, changes) {
    this.assertValidParameters(folders, changes);

    try {
      await this.getPassphrase();
    } catch (error) {
      this.cleanup();
      throw error;
    }

    try {
      this.progressService.title = i18n.t('Sharing folder {{name}}', {name: this.folder.name});
      this.progressService.start(null, i18n.t('Initializing ...'));
      await this.findAllForShare();
      this.progressService.updateGoals(this.getGoals());

      await this.progressService.finishStep(i18n.t('Calculating changes...'), true);
      this.calculateChanges();
      await this.share();
      await this.progressService.finishStep(i18n.t('Done'), true);
      await this.progressService.close();
      this.cleanup();
    } catch (error) {
      await this.progressService.close();
      this.cleanup();
      throw error;
    }
  }

  /**
   * Assert controller main parameters are valid
   *
   * @param {FoldersCollection} folders
   * @param {PermissionChangesCollection} changes
   * @throws {Error} if multi share requested, if no changes are provided
   */
  assertValidParameters(folders, changes) {
    if (!folders || folders.length > 1) {
      throw new Error('Sharing multiple folders at once is not supported');
    }
    if (!changes || !changes.length) {
      throw new Error('ShareFoldersController, invalid request changes can not be empty.');
    }

    this.folders = folders;
    this.folder = folders.items[0];
    this.originalChanges = changes;

    if (!this.folder.isOwner()) {
      throw new Error(i18n.t('The folder cannot be shared. Insufficient rights.'));
    }
  }

  /**
   * GetPassphrase
   * @returns {Promise<void>}
   */
  async getPassphrase() {
    /*
     * Get the passphrase if needed and decrypt secret key
     * We do this to confirm the move even if there is nothing to decrypt/re-encrypt
     */
    const passphrase = await passphraseController.get(this.worker);
    this.privateKey = await GetDecryptedUserPrivateKeyService.getKey(passphrase);
  }

  /**
   * findAllForShare
   * @returns {Promise<void>}
   */
  async findAllForShare() {
    /*
     * Get all folders contained in this folder
     * and get all the resources contain in this folder and subfolders
     */
    this.subFolders = await this.folderModel.getAllChildren([this.folder.id]);
    this.resources = await this.resourceModel.getAllByParentIds([this.folder.id, ...this.subFolders.ids]);

    // filter to keep only the resources and folders where the user can change permissions / share
    this.resources = this.resources.getAllWhereOwner();
    this.subFolders = this.subFolders.getAllWhereOwner();

    // Get more detailed permissions for all of these affected items if any
    if (this.resources.length) {
      this.resources = await this.resourceModel.findAllForShare(this.resources.ids);
    }
    if (this.subFolders.length) {
      this.subFolders = await this.folderModel.findAllForShare(this.subFolders.ids);
    }
  }

  /**
   * Set goals and init progress counter
   * @returns {number}
   */
  getGoals() {
    /*
     * calculate changes for folder + subfolders + resources
     * init + (folders to update * 2) + (resources to update * get secret, decrypt, encrypt, share) + sync keyring
     */
    return 3 + (this.subFolders.length * 2) + (this.resources.length * 4);
  }

  /**
   * Build changes to be used in bulk share
   */
  calculateChanges() {
    // Add current folder changes to final folders changes
    this.foldersChanges.merge(this.originalChanges);

    // Calculate changes for subfolders
    for (const subfolder of this.subFolders) {
      this.foldersChanges.merge(PermissionChangesCollection.reuseChanges(
        subfolder.permission.aco, subfolder.id, subfolder.permissions, this.originalChanges, this.folder.permissions
      ));
    }

    // Calculate changes for resources inside these folders
    for (const resource of this.resources) {
      this.resourcesChanges.merge(PermissionChangesCollection.reuseChanges(
        resource.permission.aco, resource.id, resource.permissions, this.originalChanges, this.folder.permissions
      ));
    }
  }

  /**
   * Bulk share
   * @returns {Promise<void>}
   */
  async share() {
    // Update folders permissions
    if (this.foldersChanges.length) {
      const folders = new FoldersCollection([this.folder]);
      folders.merge(this.subFolders);
      await Share.bulkShareFolders(folders, this.foldersChanges, this.folderModel,  async message => {
        await this.progressService.finishStep(message);
      });
    }

    // Share resources
    if (this.resourcesChanges.length) {
      const resourcesDto = this.resources.toDto({secrets: true});
      const changesDto = this.resourcesChanges.toDto();
      await this.progressService.finishStep(i18n.t('Synchronizing keys'), true);
      await this.keyring.sync();
      await Share.bulkShareResources(resourcesDto, changesDto, this.privateKey, async message => {
        await this.progressService.finishStep(message);
      });
      await this.resourceModel.updateLocalStorage();
    }
  }

  /**
   * flush sensitive info at the end or in case of error
   * @returns {void}
   */
  cleanup() {
    this.privateKey = null;
  }
}

export default ShareFoldersController;
