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
 * @since         2.13.0
 */
import Keyring from "../../model/keyring";
import ResourceModel from "../../model/resource/resourceModel";
import {PassphraseController as passphraseController} from "../passphrase/passphraseController";
import GetDecryptedUserPrivateKeyService from "../../service/account/getDecryptedUserPrivateKeyService";
import FolderModel from "../../model/folder/folderModel";
import Share from "../../model/share";
import FolderEntity from "../../model/entity/folder/folderEntity";
import FoldersCollection from "../../model/entity/folder/foldersCollection";
import PermissionChangesCollection from "../../model/entity/permission/change/permissionChangesCollection";
import i18n from "../../sdk/i18n";
import ProgressService from "../../service/progress/progressService";


class MoveFolderController {
  /**
   * MoveFolderController constructor
   *
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} clientOptions
   */
  constructor(worker, requestId, clientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.folderModel = new FolderModel(clientOptions);
    this.resourceModel = new ResourceModel(clientOptions);
    this.keyring = new Keyring();

    // Work variables
    this.folderId = null;
    this.folder = null;
    this.parentFolder = null;

    this.destinationFolderId = null;
    this.destinationFolder = null;

    this.subFolders = null;
    this.foldersChanges = new PermissionChangesCollection([]);

    this.resources = null;
    this.resourcesChanges = new PermissionChangesCollection([]);

    this.passphrase = null;
    this.privateKey = null;

    this.progressService = new ProgressService(this.worker, i18n.t('Moving folder'));
  }

  /**
   * Move folder.
   * @param {array} folderId: The folder to move
   * @param {(string|null)} destinationFolderId:  The destination folder
   */
  async main(folderId, destinationFolderId) {
    await this.assertValidParameters(folderId, destinationFolderId);

    try {
      await this.getPassphrase();
    } catch (error) {
      this.cleanup();
      throw error;
    }
    try {
      await this.findAllForShare();
      this.progressService.start(this.getGoals(), i18n.t('Initializing ...'));
      await this.progressService.finishStep(i18n.t('Calculating changes...'), true);
      await this.calculateChanges();
      await this.share();
      await this.move();
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
   * Sanity check
   * @returns {Promise<void>}
   */
  async assertValidParameters(folderId, destinationFolderId) {
    if (destinationFolderId !== null) {
      await this.folderModel.assertFolderExists(destinationFolderId);
    }
    if (folderId) {
      await this.folderModel.assertFolderExists(folderId);
    } else {
      throw new Error(i18n.t('Could not move, expecting a folder to be provided.'));
    }
    if (folderId === destinationFolderId) {
      throw new Error(i18n.t('The folder cannot be moved inside itself.'));
    }
    this.destinationFolderId = destinationFolderId;
    this.folderId = folderId;
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
    this.folder = await this.folderModel.findForShare(this.folderId);

    if (this.destinationFolderId) {
      this.destinationFolder = await this.folderModel.findForShare(this.destinationFolderId);
    }
    if (this.folder.folderParentId) {
      this.parentFolder = await this.folderModel.findForShare(this.folder.folderParentId);
    }
    this.assertFolderCanBeMoved();

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
   * Filter out work needed on resources
   * @return void
   */
  assertFolderCanBeMoved() {
    if (this.folder.folderParentId === this.destinationFolderId) {
      const message = i18n.t('Folder {{name}} is already in folder {{destination}}.', {name: this.folder.name, destination: this.destinationFolder.name});
      throw new Error(message);
    }
    if (!FolderEntity.canFolderMove(this.folder, this.parentFolder, this.destinationFolder)) {
      const message = i18n.t('Folder {{name}} can not be moved.', {name: this.folder.name});
      throw new Error(message);
    }
  }

  /**
   * Set goals and init progress counter
   * @returns {number}
   */
  getGoals() {
    /*
     * calculate changes for folder + subfolders + resources
     * init + move + (folders to update * 2) + (resources to update * get secret, decrypt, encrypt, share) + sync keyring
     */
    return 3 + (this.subFolders.length * 2) + (this.resources.length * 4);
  }

  /**
   * Build changes to be used in bulk share
   */
  async calculateChanges() {
    await this.progressService.finishStep(i18n.t('Calculating changes for {{name}}', {name: this.folder.name}));
    /*
     * When a shared folder is moved, we do not change permissions when:
     * - move is from the root to a personal folder
     * - move is from a personal folder to a personal folder;
     * - move is from a personal folder to the root.
     */
    if (this.folder.isShared()
      && (this.destinationFolderId === null || this.destinationFolder.isPersonal())
      && (this.folder.folderParentId === null || this.parentFolder.isPersonal())) {
      return;
    }

    // Calculate permission changes for current folder
    if (this.folder.permission.isOwner()) {
      this.foldersChanges.merge(
        this.folderModel.calculatePermissionsChangesForMove(
          this.folder, this.parentFolder, this.destinationFolder
        ));
    }
    // Add the ones for the sub folders
    for (const subfolder of this.subFolders) {
      if (subfolder.permission.isOwner()) {
        this.foldersChanges.merge(
          this.folderModel.calculatePermissionsChangesForMove(
            subfolder, this.parentFolder, this.destinationFolder
          ));
      }
    }
    // And for the resources
    for (const resource of this.resources) {
      if (resource.permission.isOwner()) {
        this.resourcesChanges.merge(this.resourceModel.calculatePermissionsChangesForMove(
          resource, this.parentFolder, this.destinationFolder
        ));
      }
    }
  }

  /**
   * Bulk share
   * @returns {Promise<void>}
   */
  async share() {
    if (this.foldersChanges.length || this.resourcesChanges.length) {
      /*
       * Some permission changes are possible, ask user what strategy to adopt
       * This also serves as a confirmation prior to a typically sensitive operation
       */
      const strategy = await this.worker.port.request('passbolt.folders.move-strategy.request', this.destinationFolderId, [this.folderId], []);
      if (strategy.moveOption === 'keep') {
        return;
      }
    }

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
   * Change folder parent id
   * @returns {Promise<void>}
   */
  async move() {
    await this.progressService.finishStep(i18n.t('Moving {{name}}', {name: this.folder.name}));
    await this.folderModel.move(this.folder.id, this.destinationFolderId);
  }

  /**
   * flush sensitive info at the end or in case of error
   * @returns {void}
   */
  cleanup() {
    this.privateKey = null;
  }
}

export default MoveFolderController;
