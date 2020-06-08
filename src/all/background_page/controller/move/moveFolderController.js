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
const Worker = require('../../model/worker');

const {Crypto} = require('../../model/crypto');
const {Keyring} = require('../../model/keyring');
const {Share} = require('../../model/share');
const {FolderEntity} = require('../../model/entity/folder/folderEntity');
const {FoldersCollection} = require('../../model/entity/folder/foldersCollection');
const {FolderModel} = require('../../model/folder/folderModel');
const {ResourceModel} = require('../../model/resource/resourceModel');
const {PermissionChangesCollection} = require('../../model/entity/permission/permissionChangesCollection');

const passphraseController = require('../passphrase/passphraseController');
const progressController = require('../progress/progressController');

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
    this.crypto = new Crypto();

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
    } catch(error) {
      this.cleanup();
      throw error;
    }
    try {
      await progressController.open(this.worker, 'Moving folder', 1, 'Initializing...');
      await this.findAllForShare();
      await this.setGoals();
      await this.calculateChanges();
      await this.share();
      await this.move();
      await progressController.update(this.worker, this.goals, 'Done');
      await progressController.close(this.worker);
      this.cleanup()
    } catch(error) {
      await progressController.close(this.worker);
      this.cleanup()
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
      throw new Error('Could not move, expecting a folder to be provided.');
    }
    if (folderId === destinationFolderId) {
      throw new Error('The folder cannot be moved inside itself.');
    }
    this.destinationFolderId = destinationFolderId;
    this.folderId = folderId;
  }

  /**
   * GetPassphrase
   * @returns {Promise<void>}
   */
  async getPassphrase() {
    // Get the passphrase if needed and decrypt secret key
    // We do this to confirm the move even if there is nothing to decrypt/re-encrypt
    this.passphrase = await passphraseController.get(this.worker);
    this.privateKey = await this.crypto.getAndDecryptPrivateKey(this.passphrase);
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

    // Get all folders contained in this folder
    // and get all the resources contain in this folder and subfolders
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
      throw new Error(`Folder ${this.folder.name} is already in folder ${this.destinationFolder.name}.`);
    }
    if (!FolderEntity.canFolderMove(this.folder, this.parentFolder, this.destinationFolder)) {
      throw new Error(`Folder ${this.folder.name} can not be moved.`);
    }
  }

  /**
   * Set goals and init progress counter
   * @returns {Promise<void>}
   */
  async setGoals() {
    // calculate changes for folder + subfolders + resources
    // init + move + (folders to update * 2) + (resources to update * get secret, decrypt, encrypt, share) + sync keyring
    this.goals = 3 + (this.subFolders.length * 2) + (this.resources.length * 4);
    this.progress = 0;
    await progressController.updateGoals(this.worker, this.goals);
    await progressController.update(this.worker, this.progress++, 'Calculating changes...');
  }

  /**
   * Build changes to be used in bulk share
   * @returns {Promise<void>}
   */
  async calculateChanges() {
    await progressController.update(this.worker, this.progress++, `Calculating changes for ${this.folder.name}`);

    // When a shared folder is moved, we do not change permissions when:
    // - move is from the root to a personal folder
    // - move is from a personal folder to a personal folder;
    // - move is from a personal folder to the root.
    if (this.folder.isShared()
      && (this.destinationFolderId === null || this.destinationFolder.isPersonal())
      && (this.folder.folderParentId === null || this.parentFolder.isPersonal())) {
      return;
    }

    // Calculate permission changes for current folder
    if (this.folder.permission.isOwner()) {
      this.foldersChanges.merge(
        await this.folderModel.calculatePermissionsChangesForMove(
          this.folder, this.parentFolder, this.destinationFolder
      ));
    }
    // Add the ones for the sub folders
    for (let subfolder of this.subFolders) {
      if (subfolder.permission.isOwner()) {
        this.foldersChanges.merge(
          await this.folderModel.calculatePermissionsChangesForMove(
            subfolder, this.parentFolder, this.destinationFolder
        ));
      }
    }
    // And for the resources
    for (let resource of this.resources) {
      if (resource.permission.isOwner()) {
        this.resourcesChanges.merge(await this.resourceModel.calculatePermissionsChangesForMove(
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
      // Some permission changes are possible, ask user what strategy to adopt
      // This also serves as a confirmation prior to a typically sensitive operation
      const reactWorker = this.getReactWorker();
      const strategy = await reactWorker.port.request('passbolt.folders.move-strategy.request');
      if (strategy.moveOption === 'keep') {
        return;
      }
    }

    // Update folders permissions
    if (this.foldersChanges.length) {
      let folders = new FoldersCollection([this.folder]);
      folders.merge(this.subFolders);
      await Share.bulkShareFolders(folders, this.foldersChanges, this.folderModel,  async message => {
        await progressController.update(this.worker, this.progress++, message);
      });
    }

    // Share resources
    if (this.resourcesChanges.length) {
      let resourcesDto = this.resources.toDto({secrets:true});
      let changesDto = this.resourcesChanges.toDto();
      await progressController.update(this.worker, this.progress++, 'Synchronizing keys');
      await this.keyring.sync();
      await Share.bulkShareResources(resourcesDto, changesDto, this.passphrase, async message => {
        await progressController.update(this.worker, this.progress++, message);
      });
    }
  }

  /**
   * Change folder parent id
   * @returns {Promise<void>}
   */
  async move() {
    await progressController.update(this.worker, this.progress++, `Moving ${this.folder.name}`);
    await this.folderModel.move(this.folder.id, this.destinationFolderId);
  }

  /**
   * flush sensitive info at the end or in case of error
   * @returns {void}
   */
  cleanup() {
    this.passphrase = null;
    this.privateKey = null;
  }

  /**
   * The treatment of the requests coming from any legacy worker should be delegated to the new
   * react application.
   * @return {Worker}
   */
  getReactWorker() {
    if (this.worker.isLegacyWorker()) {
      return Worker.get('ReactApp', this.worker.tab.id);
    }
    return this.worker;
  };

}

exports.MoveFolderController = MoveFolderController;
